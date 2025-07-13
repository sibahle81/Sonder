using Serilog;

using System;

namespace RMA.Common.Extensions
{
    public static class DebugLogExtension
    {
        public static string LogDebug(this string messageTemplate)
        {
            var reference = string.Empty;
            try
            {
                Log.Logger.Warning(messageTemplate);
            }
            catch (Exception)
            {
                Console.Write($"Unable to log debug {messageTemplate}");
            }

            return reference;
        }
    }
}