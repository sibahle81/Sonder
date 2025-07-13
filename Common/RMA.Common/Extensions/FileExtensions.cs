using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Extensions
{
    public static class FileExtensions
    {
        public static async Task DeleteAsync(this FileInfo fi, TimeSpan duration)
        {
            if (fi == null)
            {
                throw new ArgumentNullException(nameof(fi), "fi FileInfo is null");
            }
            if (fi.Exists)
            {
                var now = DateTimeHelper.SaNow;
                while (DateTimeHelper.SaNow < now.Add(duration))
                {
                    try
                    {
                        await Task.Factory.StartNew(fi.Delete);
                    }
                    catch (IOException)
                    {
                        Thread.Sleep(TimeSpan.FromSeconds(1));
                        //The specified file is in use or there is an open handle on the file, so suppress this exception
                        //all other exceptions will be thrown
                    }
                }
            }
        }

        public static void Delete(this string filePath, TimeSpan duration)
        {
            if (File.Exists(filePath))
            {
                var now = DateTimeHelper.SaNow;
                while (DateTimeHelper.SaNow < now.Add(duration))
                {
                    try
                    {
                        File.Delete(filePath);
                    }
                    catch (IOException)
                    {
                        Thread.Sleep(TimeSpan.FromSeconds(2));
                        //The specified file is in use or there is an open handle on the file, so suppress this exception
                        //all other exceptions will be thrown
                    }
                }
            }
        }
    }
}