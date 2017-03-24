---
layout: post
title: 显示消息通知
---
## 背景
最近有个项目需要做web版本的聊天工具，实现功能就是web QQ那样子。  
聊天的功能都实现得差不多了，但客户还想要一个新消息提示功能。好像Web QQ上也有实现。于是赶快网上找资料。
## Notification
原来人家浏览器厂商早就有这个功能了。[Notification](https://developer.mozilla.org/zh-CN/docs/Web/API/notification)
于是简单实现一个：   

    <script type="text/javascript">
        function check() {
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
            }
            if (Notification.permission !== "granted") {
                Notification.requestPermission(function (permission) {
                    // Whatever the user answers, we make sure we store the information
                    if (!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                });
            }
        }

        function notifyMe() {
            check();
            if (1 == 2) {
                var notification = new Notification("Hi there!");
            }
            else {
                var notification = new Notification('新的消息', {
                    icon: 'https://developer.cdn.mozilla.net/static/img/opengraph-logo.dc4e08e2f6af.png',
                    body: "Hey there! You've been notified!",
                });

                notification.onclick = function () {
                    window.open("http://blog.zhumingwu.cn");
                };

            }
        }
    </script>

大家可以点击 <button id="show" onclick='notifyMe()'>Show notification</button> 试试效果。

<script type="text/javascript">
function check() {
// Let's check if the browser supports notifications
if (!("Notification" in window)) {
alert("This browser does not support desktop notification");
}
if (Notification.permission !== "granted") {
Notification.requestPermission(function (permission) {
// Whatever the user answers, we make sure we store the information
if (!('permission' in Notification)) {
Notification.permission = permission;
}
});
}
}

function notifyMe() {
check();
if (1 == 2) {
var notification = new Notification("Hi there!");
}
else {
var notification = new Notification('新的消息', {
icon: 'https://developer.cdn.mozilla.net/static/img/opengraph-logo.dc4e08e2f6af.png',
body: "Hey there! You've been notified!",
});

notification.onclick = function () {
window.open("http://blog.zhumingwu.cn");
};

}
}
</script>
