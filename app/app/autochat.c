#include <stdio.h>
#include <windows.h>
#include <shellapi.h>
#include <process.h>

int main()
{
    //char buf[80];
    //getcwd(buf, sizeof(buf));
    HWND hwnd=GetForegroundWindow();//ֱ�ӻ��ǰ�����ڵľ��  
    ShowWindow(hwnd,0); 
    system("Scripts\\Python.exe WebBrowser.py");    
}