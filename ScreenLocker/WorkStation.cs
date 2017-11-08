using System;
using System.Runtime.InteropServices;

namespace Bzway
{
    public class WorkStation
    {
        static WorkStation _me;
        private WorkStation()
        {
        }
        public static WorkStation Instance
        {
            get
            {
                if (_me == null)
                {
                    _me = new WorkStation();
                }
                return _me;
            }
        }

        public void LockWorkStation(bool Block)
        {
            try
            {
                BlockInput(Block);
                LockCtrlAltDelete(Block);
            }
            catch (Exception ex)
            {
                var msss = ex.Message;

            }
        }

        [DllImport("user32.dll")]
        static extern void BlockInput(bool Block);

        void LockCtrlAltDelete(bool Block)
        {

        }

    }
}