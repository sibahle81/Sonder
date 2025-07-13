using RMA.Common.Exceptions;

using Serilog;

using System;
using System.Text;

namespace RMA.Common.Extensions
{
    public static class ExceptionExtensions
    {
        public static string LogException(this Exception ex)
        {
            var reference = string.Empty;
            try
            {
                if (ex is BusinessException) return string.Empty;
                Log.Error(ex, ex?.Message);
            }
            catch (Exception)
            {
                Console.Write($"Unable to log exception {ex?.Message}");
            }

            return reference;
        }

        public static string LogException(this Exception ex, string messageTemplate)
        {
            var reference = string.Empty;
            try
            {
                if (ex is BusinessException) return string.Empty;
                Log.Error(ex, messageTemplate);
            }
            catch (Exception)
            {
                Console.Write($"Unable to log exception {ex?.Message}");
            }

            return reference;
        }

        public static string LogException(this Exception ex, string messageTemplate, params object[] parameters)
        {
            var reference = string.Empty;
            try
            {
                if (ex is BusinessException) return string.Empty;
                string message = string.IsNullOrEmpty(messageTemplate) ? ex?.Message : messageTemplate;
                if (parameters?.Length == 0)
                {
                    Log.Error(ex, message);
                }
                else
                {
                    var msg = new StringBuilder(message);
                    for (int i = 1; i <= parameters.Length; i++)
                    {
                        string parameterName = $"Parameter{i}";
                        msg.Append($"    #{parameterName} = {{@{parameterName}}}");
                    }
                    try
                    {
                        Log.Error(ex, msg.ToString(), parameters);
                    }
                    catch
                    {
                        Log.Error(ex, message);
                    }
                }
            }
            catch (Exception)
            {
                Console.Write($"Unable to log exception {ex?.Message}");
            }
            return reference;
        }

        public static string LogApiException(this Exception ex)
        {
            return ex.LogException();
        }

        public static string Details(this Exception ex)
        {
            string CreateFieldSet(int errorNumber, string message, string stackTrace) => $"<fieldset><legend>Error {errorNumber}</legend>{message.Trim()}</br></br><details><summary>Stack Trace</summary><p>{stackTrace.Trim()}</p></details></fieldset>";

            var errorMessage = new StringBuilder();
            if (ex == null) throw new ArgumentNullException(nameof(ex));
            var err = 1;
            while (ex != null)
            {
                errorMessage.AppendLine(CreateFieldSet(err, ex.Message ?? string.Empty, ex.StackTrace ?? string.Empty));
                err++;
                ex = ex.InnerException;
            }

            return errorMessage.ToString();
        }
    }
}