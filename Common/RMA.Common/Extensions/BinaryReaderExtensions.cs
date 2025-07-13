using System.IO;
using System.Threading.Tasks;
using System;

namespace RMA.Common.Extensions
{
    public static class BinaryReaderExtensions
    {
        public static async Task<byte[]> ReadAllBytes(this BinaryReader reader)
        {
            if (reader == null) throw new ArgumentNullException(nameof(reader), "reader is null");
            const int bufferSize = 4096;
            using (var ms = new MemoryStream())
            {
                var buffer = new byte[bufferSize];
                int count;
                while ((count = reader.Read(buffer, 0, buffer.Length)) != 0) await ms.WriteAsync(buffer, 0, count);
                return ms.ToArray();
            }
        }
    }
}