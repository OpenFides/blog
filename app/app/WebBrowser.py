#!/usr/bin/env python
# -*- coding: utf-8 -*-
__author__ = 'adm zhu'

import sys
import itchat
import os
import json
import time
from PyQt5.QtWidgets import QApplication
from PyQt5.QtWidgets import QWidget
from PyQt5.QtCore import QObject, pyqtSlot, QUrl
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtGui import QIcon
@itchat.msg_register(itchat.content.TEXT, isFriendChat=True, isGroupChat=True,isMpChat=True)
def text_reply(msg):
    itchat.send(msg=msg.text)
    #msg.user.send("%s : %s" % (msg.user.NickName, msg.text))
def login():
    itchat.auto_login()
    #itchat.run()
def getFriends():
    global page
    friends = itchat.get_friends(update=True)
    jsstring =json.dumps(friends, ensure_ascii=False)
    print(jsstring)
    page.runJavaScript("var friends = "+ jsstring)
    page.runJavaScript("LoadFriends(friends);");
def getChatRooms():
    global page
    rooms = itchat.get_chatrooms(update=True)
    jsstring =json.dumps(rooms, ensure_ascii=False)
    print(jsstring)
    page.runJavaScript("var friends = "+ jsstring)
    page.runJavaScript("LoadFriends(friends);");
def getMPs():
    global page
    mps = itchat.get_mps(update=True)
    jsstring =json.dumps(mps, ensure_ascii=False)
    print(jsstring)
    page.runJavaScript("var friends = "+ jsstring)
    page.runJavaScript("LoadFriends(friends);");

class CallHandler(QObject):
    @pyqtSlot(str, result=str)
    def Wechat(self, arg):
        if (arg =="login"):
            login()
        elif(arg =="friend"):
            getFriends()
        elif (arg == "chatRoom"):
            getChatRooms()
        elif (arg == "mp"):
            getMPs()
        elif(arg=="send"):
            send()
    @pyqtSlot(int, result=str)
    def sleep(self, seconds):
        time.sleep(seconds)
    @pyqtSlot(str, str, result=str)
    def sendMsg(self, msg, toUser):
        print("send " + msg +" to " + toUser);
        itchat.send(msg=msg, toUserName=toUser)
page = 0

if __name__ == '__main__':
    app = QApplication(sys.argv)
    view = QWebEngineView()
    view.setWindowTitle("AutoChat")
    channel = QWebChannel()
    handler = CallHandler()
    channel.registerObject('pyjs', handler)
    page = view.page()
    page.setWebChannel(channel)
    path = "file:///"+os.getcwd().replace("\\","/")+ "/index.html"
    view.load(QUrl(path))
    view.setWindowIcon(QIcon('app.png'))
    view.show()
    sys.exit(app.exec_())
