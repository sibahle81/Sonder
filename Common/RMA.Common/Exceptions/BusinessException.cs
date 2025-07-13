using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace RMA.Common.Exceptions
{
    [Serializable]
    public class BusinessException : Exception
    {
        public BusinessException()
        {
            ErrorMessages = new List<string>();
        }

        public BusinessException(string message)
            : base(message)
        {
            ErrorMessages = new List<string> { message };
        }

        public BusinessException(List<string> errorCodes)
        {
            ErrorMessages = errorCodes;
        }

        protected BusinessException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            ErrorMessages = (List<string>)info.GetValue("ErrorCodes", typeof(List<string>));
        }

        public BusinessException(string message, Exception innerException) : base(message, innerException)
        {
        }

        public List<string> ErrorMessages { get; set; }

        public override string Message => GetErrorMessage();

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            info?.AddValue("ErrorCodes", ErrorMessages);
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