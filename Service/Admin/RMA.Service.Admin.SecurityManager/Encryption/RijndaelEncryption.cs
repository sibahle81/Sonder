using System;
using System.IO;
using System.Security.Cryptography;

namespace RMA.Service.Admin.SecurityManager.Encryption
{
    public static class RijndaelEncryption //: IEncryptionService
    {
        private static readonly byte[] Key =
        {
            118, 123, 23, 18, 161, 125, 35, 68, 126, 213, 16, 115, 68, 217, 58, 108, 56, 200, 5, 78, 28, 128, 99, 208,
            61, 56, 10, 87, 187, 162, 20, 38
        };

        private static readonly byte[] Iv = { 33, 251, 14, 15, 104, 16, 14, 252, 4, 54, 18, 4, 62, 76, 19, 191 };

        public static string Encrypt(string text)
        {
            if (text == null || text.Length <= 0) throw new ArgumentNullException(nameof(text));

            using (var rijndaelManaged = new RijndaelManaged())
            {
                rijndaelManaged.Key = Key;
                rijndaelManaged.IV = Iv;

                var encryptor = rijndaelManaged.CreateEncryptor(rijndaelManaged.Key, rijndaelManaged.IV);

                using (var memoryStream = new MemoryStream())
                {
                    using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        using (var streamWriter = new StreamWriter(cryptoStream))
                        {
                            streamWriter.Write(text);
                        }

                        var bytes = memoryStream.ToArray();
                        return Convert.ToBase64String(bytes);
                    }
                }
            }
        }

        public static string Decrypt(string text)
        {
            if (text == null || text.Length <= 0) throw new ArgumentNullException(nameof(text));
            var bytes = Convert.FromBase64String(text);

            using (var rijndaelManaged = new RijndaelManaged())
            {
                rijndaelManaged.Key = Key;
                rijndaelManaged.IV = Iv;

                var decryptor = rijndaelManaged.CreateDecryptor(rijndaelManaged.Key, rijndaelManaged.IV);

                // Create the streams used for decryption. 
                using (var memoryStream = new MemoryStream(bytes))
                {
                    using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                    {
                        using (var streamReader = new StreamReader(cryptoStream))
                        {
                            return streamReader.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
}