using RMA.Common.Extensions;

using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.Serialization;
using System.Text;
using System.Threading;

namespace RMA.Common.Entities
{
    [DataContract]
    public class ExceptionInfo
    {
        public ExceptionInfo()
        {
            Reference = Guid.NewGuid().ToString("N").Substring(22);
            DateTime = DateTimeHelper.SaNow;
            UserName = Thread.CurrentPrincipal.Identity.Name;
            AppDomainName = AppDomain.CurrentDomain.FriendlyName;
            HostName = Environment.MachineName;
        }

        public ExceptionInfo(Exception ex)
            : this()
        {
            ExceptionMessage = ex?.Message;
            FormattedValue = GetFormattedValue(ex);
            SerializedValue = GetSerializedValue(ex);
            ExceptionType = ex.GetType().FullName;
            if (!ex.Data.Contains("rma:reference")) ex.Data.Add("rma:reference", Reference);

            // Get stack trace for the exception with source file information
            var st = new StackTrace(ex, true);
            var frameNumber = 0;

            while (frameNumber < st.FrameCount)
            {
                var frame = st.GetFrame(frameNumber);
                SourceLineNumber = frame.GetFileLineNumber();
                SourceFileName = frame.GetFileName();
                SourceMethodName = frame.GetMethod().Name;
                if (!string.IsNullOrEmpty(SourceFileName)) break;
                frameNumber++;
            }
        }

        public ExceptionInfo(Exception ex, string controller, string action)
            : this(ex)
        {
            if (!string.IsNullOrEmpty(controller) && !string.IsNullOrEmpty(controller.Trim()))
            {
                Controller = controller;
                Action = action;
            }
        }

        [DataMember] public int ErrorLogId { get; set; }

        [DataMember] public DateTime DateTime { get; private set; }

        [DataMember] public string UserName { get; private set; }

        [DataMember] public string Reference { get; private set; }

        [DataMember] public string ExceptionMessage { get; private set; }

        [DataMember] public string FormattedValue { get; private set; }

        [DataMember] public string SerializedValue { get; private set; }

        [DataMember] public string ExceptionType { get; private set; }

        [DataMember] public string SourceFileName { get; private set; }

        [DataMember] public string SourceMethodName { get; private set; }

        [DataMember] public int SourceLineNumber { get; private set; }

        [DataMember] public string AppDomainName { get; private set; }

        [DataMember] public string HostName { get; private set; }

        [DataMember] public string Controller { get; private set; }

        [DataMember] public string Action { get; private set; }

        private static string GetFormattedValue(Exception ex)
        {
            string FormatError(int errorNumber, string message, string stackTrace)
            {
                return string.Format("Error {0}{3}{1}{3}{2}{3}{3}",
                    errorNumber,
                    message == null ? string.Empty : message.Trim(),
                    stackTrace == null ? string.Empty : stackTrace.Trim(),
                    Environment.NewLine);
            }

            var errorMessage = new StringBuilder();
            if (ex == null) throw new ArgumentNullException(nameof(ex));
            var err = 1;
            while (ex != null)
            {
                errorMessage.AppendLine(FormatError(err, ex.Message, ex.StackTrace));
                err++;
                ex = ex.InnerException;
            }

            return errorMessage.ToString();
        }

        private static string GetSerializedValue(Exception ex)
        {
            try
            {
                using (var memoryStream = new MemoryStream())
                {
                    using (var reader = new StreamReader(memoryStream))
                    {
                        var serializer = new NetDataContractSerializer();
                        serializer.WriteObject(memoryStream, ex);
                        memoryStream.Position = 0;
                        return reader.ReadToEnd();
                    }
                }
            }
            catch (Exception)
            {
                //Most likely a Serialization issue so we cannot get that error here.
                return ex.ToString();
            }
        }
    }
}