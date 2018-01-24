"use strict";
var QWebChannelMessageTypes = {
    signal: 1,
    propertyUpdate: 2,
    init: 3,
    idle: 4,
    debug: 5,
    invokeMethod: 6,
    connectToSignal: 7,
    disconnectFromSignal: 8,
    setProperty: 9,
    response: 10,
};

var QWebChannel = function (transport, initCallback) {
    if (typeof transport !== "object" || typeof transport.send !== "function") {
        console.error("The QWebChannel expects a transport object with a send function and onmessage callback property." +
            " Given is: transport: " + typeof (transport) + ", transport.send: " + typeof (transport.send));
        return;
    }

    var channel = this;
    this.transport = transport;

    this.send = function (data) {
        if (typeof (data) !== "string") {
            data = JSON.stringify(data);
        }
        channel.transport.send(data);
    }

    this.transport.onmessage = function (message) {
        var data = message.data;
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        switch (data.type) {
            case QWebChannelMessageTypes.signal:
                channel.handleSignal(data);
                break;
            case QWebChannelMessageTypes.response:
                channel.handleResponse(data);
                break;
            case QWebChannelMessageTypes.propertyUpdate:
                channel.handlePropertyUpdate(data);
                break;
            default:
                console.error("invalid message received:", message.data);
                break;
        }
    }

    this.execCallbacks = {};
    this.execId = 0;
    this.exec = function (data, callback) {
        if (!callback) {
            // if no callback is given, send directly
            channel.send(data);
            return;
        }
        if (channel.execId === Number.MAX_VALUE) {
            // wrap
            channel.execId = Number.MIN_VALUE;
        }
        if (data.hasOwnProperty("id")) {
            console.error("Cannot exec message with property id: " + JSON.stringify(data));
            return;
        }
        data.id = channel.execId++;
        channel.execCallbacks[data.id] = callback;
        channel.send(data);
    };

    this.objects = {};

    this.handleSignal = function (message) {
        var object = channel.objects[message.object];
        if (object) {
            object.signalEmitted(message.signal, message.args);
        } else {
            console.warn("Unhandled signal: " + message.object + "::" + message.signal);
        }
    }

    this.handleResponse = function (message) {
        if (!message.hasOwnProperty("id")) {
            console.error("Invalid response message received: ", JSON.stringify(message));
            return;
        }
        channel.execCallbacks[message.id](message.data);
        delete channel.execCallbacks[message.id];
    }

    this.handlePropertyUpdate = function (message) {
        for (var i in message.data) {
            var data = message.data[i];
            var object = channel.objects[data.object];
            if (object) {
                object.propertyUpdate(data.signals, data.properties);
            } else {
                console.warn("Unhandled property update: " + data.object + "::" + data.signal);
            }
        }
        channel.exec({ type: QWebChannelMessageTypes.idle });
    }

    this.debug = function (message) {
        channel.send({ type: QWebChannelMessageTypes.debug, data: message });
    };

    channel.exec({ type: QWebChannelMessageTypes.init }, function (data) {
        for (var objectName in data) {
            var object = new QObject(objectName, data[objectName], channel);
        }
        // now unwrap properties, which might reference other registered objects
        for (var objectName in channel.objects) {
            channel.objects[objectName].unwrapProperties();
        }
        if (initCallback) {
            initCallback(channel);
        }
        channel.exec({ type: QWebChannelMessageTypes.idle });
    });
};

function QObject(name, data, webChannel) {
    this.__id__ = name;
    webChannel.objects[name] = this;

    // List of callbacks that get invoked upon signal emission
    this.__objectSignals__ = {};

    // Cache of all properties, updated when a notify signal is emitted
    this.__propertyCache__ = {};

    var object = this;

    // ----------------------------------------------------------------------

    this.unwrapQObject = function (response) {
        if (response instanceof Array) {
            // support list of objects
            var ret = new Array(response.length);
            for (var i = 0; i < response.length; ++i) {
                ret[i] = object.unwrapQObject(response[i]);
            }
            return ret;
        }
        if (!response
            || !response["__QObject*__"]
            || response.id === undefined) {
            return response;
        }

        var objectId = response.id;
        if (webChannel.objects[objectId])
            return webChannel.objects[objectId];

        if (!response.data) {
            console.error("Cannot unwrap unknown QObject " + objectId + " without data.");
            return;
        }

        var qObject = new QObject(objectId, response.data, webChannel);
        qObject.destroyed.connect(function () {
            if (webChannel.objects[objectId] === qObject) {
                delete webChannel.objects[objectId];
                // reset the now deleted QObject to an empty {} object
                // just assigning {} though would not have the desired effect, but the
                // below also ensures all external references will see the empty map
                // NOTE: this detour is necessary to workaround QTBUG-40021
                var propertyNames = [];
                for (var propertyName in qObject) {
                    propertyNames.push(propertyName);
                }
                for (var idx in propertyNames) {
                    delete qObject[propertyNames[idx]];
                }
            }
        });
        // here we are already initialized, and thus must directly unwrap the properties
        qObject.unwrapProperties();
        return qObject;
    }

    this.unwrapProperties = function () {
        for (var propertyIdx in object.__propertyCache__) {
            object.__propertyCache__[propertyIdx] = object.unwrapQObject(object.__propertyCache__[propertyIdx]);
        }
    }

    function addSignal(signalData, isPropertyNotifySignal) {
        var signalName = signalData[0];
        var signalIndex = signalData[1];
        object[signalName] = {
            connect: function (callback) {
                if (typeof (callback) !== "function") {
                    console.error("Bad callback given to connect to signal " + signalName);
                    return;
                }

                object.__objectSignals__[signalIndex] = object.__objectSignals__[signalIndex] || [];
                object.__objectSignals__[signalIndex].push(callback);

                if (!isPropertyNotifySignal && signalName !== "destroyed") {
                    // only required for "pure" signals, handled separately for properties in propertyUpdate
                    // also note that we always get notified about the destroyed signal
                    webChannel.exec({
                        type: QWebChannelMessageTypes.connectToSignal,
                        object: object.__id__,
                        signal: signalIndex
                    });
                }
            },
            disconnect: function (callback) {
                if (typeof (callback) !== "function") {
                    console.error("Bad callback given to disconnect from signal " + signalName);
                    return;
                }
                object.__objectSignals__[signalIndex] = object.__objectSignals__[signalIndex] || [];
                var idx = object.__objectSignals__[signalIndex].indexOf(callback);
                if (idx === -1) {
                    console.error("Cannot find connection of signal " + signalName + " to " + callback.name);
                    return;
                }
                object.__objectSignals__[signalIndex].splice(idx, 1);
                if (!isPropertyNotifySignal && object.__objectSignals__[signalIndex].length === 0) {
                    // only required for "pure" signals, handled separately for properties in propertyUpdate
                    webChannel.exec({
                        type: QWebChannelMessageTypes.disconnectFromSignal,
                        object: object.__id__,
                        signal: signalIndex
                    });
                }
            }
        };
    }

    /**
     * Invokes all callbacks for the given signalname. Also works for property notify callbacks.
     */
    function invokeSignalCallbacks(signalName, signalArgs) {
        var connections = object.__objectSignals__[signalName];
        if (connections) {
            connections.forEach(function (callback) {
                callback.apply(callback, signalArgs);
            });
        }
    }

    this.propertyUpdate = function (signals, propertyMap) {
        // update property cache
        for (var propertyIndex in propertyMap) {
            var propertyValue = propertyMap[propertyIndex];
            object.__propertyCache__[propertyIndex] = propertyValue;
        }

        for (var signalName in signals) {
            // Invoke all callbacks, as signalEmitted() does not. This ensures the
            // property cache is updated before the callbacks are invoked.
            invokeSignalCallbacks(signalName, signals[signalName]);
        }
    }

    this.signalEmitted = function (signalName, signalArgs) {
        invokeSignalCallbacks(signalName, signalArgs);
    }

    function addMethod(methodData) {
        var methodName = methodData[0];
        var methodIdx = methodData[1];
        object[methodName] = function () {
            var args = [];
            var callback;
            for (var i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] === "function")
                    callback = arguments[i];
                else
                    args.push(arguments[i]);
            }

            webChannel.exec({
                "type": QWebChannelMessageTypes.invokeMethod,
                "object": object.__id__,
                "method": methodIdx,
                "args": args
            }, function (response) {
                if (response !== undefined) {
                    var result = object.unwrapQObject(response);
                    if (callback) {
                        (callback)(result);
                    }
                }
            });
        };
    }

    function bindGetterSetter(propertyInfo) {
        var propertyIndex = propertyInfo[0];
        var propertyName = propertyInfo[1];
        var notifySignalData = propertyInfo[2];
        // initialize property cache with current value
        // NOTE: if this is an object, it is not directly unwrapped as it might
        // reference other QObject that we do not know yet
        object.__propertyCache__[propertyIndex] = propertyInfo[3];

        if (notifySignalData) {
            if (notifySignalData[0] === 1) {
                // signal name is optimized away, reconstruct the actual name
                notifySignalData[0] = propertyName + "Changed";
            }
            addSignal(notifySignalData, true);
        }

        Object.defineProperty(object, propertyName, {
            configurable: true,
            get: function () {
                var propertyValue = object.__propertyCache__[propertyIndex];
                if (propertyValue === undefined) {
                    // This shouldn't happen
                    console.warn("Undefined value in property cache for property \"" + propertyName + "\" in object " + object.__id__);
                }

                return propertyValue;
            },
            set: function (value) {
                if (value === undefined) {
                    console.warn("Property setter for " + propertyName + " called with undefined value!");
                    return;
                }
                object.__propertyCache__[propertyIndex] = value;
                webChannel.exec({
                    "type": QWebChannelMessageTypes.setProperty,
                    "object": object.__id__,
                    "property": propertyIndex,
                    "value": value
                });
            }
        });

    }

    // ----------------------------------------------------------------------

    data.methods.forEach(addMethod);

    data.properties.forEach(bindGetterSetter);

    data.signals.forEach(function (signal) { addSignal(signal, false); });

    for (var name in data.enums) {
        object[name] = data.enums[name];
    }
}

//required for use with nodejs
if (typeof module === 'object') {
    module.exports = {
        QWebChannel: QWebChannel
    };
}
window.onload = function () {
    new QWebChannel(qt.webChannelTransport, function (channel) {
        window.pyjs = channel.objects.pyjs;
    });
    $("#msgHelp").children().on("click", function () {
        var item = $(this);
        $("#txtMsg").insertContent("{" + item.text().trim() + "}");
    });
};

function LoadFriends(datas) {
    $("#loadPanel").html("");
    var temp = $(".user-item");
    for (var i = 0; i < datas.length; i++) {
        var item = temp.clone();
        item.data("id", datas[i].UserName);
        item.attr("title", loadData(datas[i]));
        item.text((datas[i].RemarkName == "" ? datas[i].NickName : datas[i].RemarkName));
        $("#loadPanel").append(item);
    }
}


function loadData(data) {

    var reg = new RegExp("'|\"", "g")
    var temp = {
        "NickName": data.NickName.replace(reg, "’"),
        "RemarkName": data.RemarkName,
        "Sex": data.Sex == 0 ? "未知" : data.Sex == 1 ? "男" : "女",
        "Signature": data.Signature.replace(reg, "’"),
        "PYInitial": data.PYInitial + "|" + data.PYQuanPin + "|" + data.RemarkPYInitial + "|" + data.RemarkPYQuanPin,
        "Province": data.Province,
        "City": data.City,
        "DisplayName": data.DisplayName
    }
    return JSON.stringify(temp, null, 4); // Indented with tab

}
function SelectUser(sender) {
    if ($(sender).parent().attr("id") == "sendPanel") {
        $("#loadPanel").append($(sender));
    } else {
        $("#sendPanel").append($(sender));
    }
    var count = $('#sendPanel').children().length;
    if (count > 0) {
        $('#txtCount').text('发送消息（已经选择' + count + '人）');
    } else {
        $('#txtCount').text('发送消息');
    }
}
function SendMsg() {
    var msg = $("#txtMsg").val();
    var to = $('#sendPanel').children();
    var len = to.length;
    var sleeptime = Math.random() * (len > 40 ? 5 : 0);

    for (var i = 0; i < len; i++) {
        var item = $(to[i]);
        pyjs.sleep(sleeptime);
        try {
            var data = JSON.parse(item.attr("title"));
            pyjs.sendMsg(msg.temp(data), item.data("id"));
            item.click();
        } catch (e) {
            alert(item.attr("title"));
            alert(e);
        }
    }
}
var isSearch = false;
function search() {
    if (isSearch) {
        return
    }
    isSearch = true;
    $('#loadPanel').children().show();
    var text = $("#txtSearch").val();
    if (text.length > 0) {
        $('#loadPanel').children().each(function (i, item) {
            //if ($(item).attr("title").indexOf(text) < 0) {
            //    $(item).hide();
            //}
            if ($(item).attr("title").isLike(text) == false) {
                $(item).hide();
            }
        });
    }
    isSearch = false;
}


String.prototype.temp = function (data) {
    var template = this;
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."), v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
    });

};
/**
 * 为字符串添加模糊比较的方法
 * @param exp 模糊查询字符串，支持正则表达式
 * @param i 是否区分大小写
 * @returns
 */
String.prototype.isLike = function (exp, i) {
    var str = this;
    i = i == null ? false : i;
    if (exp.constructor == String) {
        /* 首先将表达式中的‘_’替换成‘.’，但是‘[_]’表示对‘_’的转义，所以做特殊处理 */
        var s = exp.replace(/_/g, function (m, i) {
            if (i == 0 || i == exp.length - 1) {
                return ".";
            } else {
                if (exp.charAt(i - 1) == "[" && exp.charAt(i + 1) == "]") {
                    return m;
                }
                return ".";
            }
        });
        /* 将表达式中的‘%’替换成‘.’，但是‘[%]’表示对‘%’的转义，所以做特殊处理 */
        s = s.replace(/%/g, function (m, i) {
            if (i == 0 || i == s.length - 1) {
                return ".*";
            } else {
                if (s.charAt(i - 1) == "[" && s.charAt(i + 1) == "]") {
                    return m;
                }
                return ".*";
            }
        });

        /*将表达式中的‘[_]’、‘[%]’分别替换为‘_’、‘%’*/
        s = s.replace(/\[_\]/g, "_").replace(/\[%\]/g, "%");

        /*对表达式处理完后构造一个新的正则表达式，用以判断当前字符串是否和给定的表达式相似*/
        var regex = new RegExp("" + s, i ? "" : "i");
        return regex.test(this);
    }
    return false;
};


//
//使用方法
//$(文本域选择器).insertContent("插入的内容");
//$(文本域选择器).insertContent("插入的内容"，数值); //根据数值选中插入文本内容两边的边界, 数值: 0是表示插入文字全部选择，-1表示插入文字两边各少选中一个字符。
//
//在光标位置插入内容, 并选中
(function ($) {
    $.fn.extend({
        insertContent: function (myValue, t) {
            var $t = $(this)[0];
            if (document.selection) { //ie
                this.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
                sel.moveStart('character', -l);
                var wee = sel.text.length;
                if (arguments.length == 2) {
                    var l = $t.value.length;
                    sel.moveEnd("character", wee + t);
                    t <= 0 ? sel.moveStart("character", wee - 2 * t - myValue.length) : sel.moveStart("character", wee - t - myValue.length);

                    sel.select();
                }
            } else if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
                if (arguments.length == 2) {
                    $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
                    this.focus();
                }
            }
            else {
                this.value += myValue;
                this.focus();
            }
        }
    })
})(jQuery);