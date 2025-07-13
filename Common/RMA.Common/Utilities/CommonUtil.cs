using System;
using System.Security.Cryptography;

namespace RMA.Common.Utilities
{
    public static class CommonUtil
    {
        public static int GenerateRandomNumber(int min, int max, int padding)
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                byte[] buffer = new byte[4];
                rng.GetBytes(buffer);
                var randomNumber = (int)(BitConverter.ToUInt32(buffer, 0) >> 1) % ((max - min) + 1);
                return int.Parse(randomNumber.ToString().PadRight(padding, '0'));
            }
        }
    }
}