using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace Bzway
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] arg)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            var form = new MainForm();

            if (arg.Length == 1)
            {
                double minutes;
                if (double.TryParse(arg[0], out minutes))
                {
                    form.workMinutes = minutes;
                }
            }
            Application.Run(form);
        }

    }
}