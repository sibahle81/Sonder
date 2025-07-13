using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace RMA.Common.Exceptions
{
    [Serializable]
    public class MultiTenantException : Exception
    {
        public MultiTenantException()
        {
            ErrorMessages = new List<string>();
        }

        public MultiTenantException(string message)
            : base(message)
        {
            ErrorMessages = new List<string> { message };
        }

        public MultiTenantException(List<string> errorCodes)
        {
            ErrorMessages = errorCodes;
        }

        protected MultiTenantException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            ErrorMessages = (List<string>)info.GetValue("ErrorCodes", typeof(List<string>));
        }

        public MultiTenantException(string message, Exception innerException) : base(message, innerException)
        {
        }

        public List<string> ErrorMessages { get; set; }

        public override string Message => GetErrorMessage();

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            if (info == null) return;

            info.AddValue("ErrorCodes", ErrorMessages);
            base.GetObjectData(info, context);
        }

        public override string ToString()
        {
            return GetErrorMessage();
        }

        private string GetErrorMessage()
        {
            if (ErrorMessages != null && ErrorMessages.Count > 0)
            {
                var msg = new StringBuilder();
                foreach (var error in ErrorMessages) msg.AppendFormat("{0}, ", error);
                return msg.ToString().Substring(0, msg.Length - 2);
            }

            return string.IsNullOrEmpty(base.Message) ? "No ErrorCodes Defined" : base.Message;
        }

        public string FirstError()
        {
            var detail = ErrorMessages.FirstOrDefault();
            if (detail != null)
                return detail;
            return "ERR001";
        }
    }
}