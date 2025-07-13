using System;
using System.Runtime.Serialization;

namespace RMA.Common.Exceptions
{
    [Serializable]
    public class TechnicalException : Exception
    {
        public TechnicalException()
        {
        }

        public TechnicalException(string message)
            : base(message)
        {
        }

        public TechnicalException(string message, Exception inner)
            : base(message, inner)
        {
        }

        public TechnicalException(string code, string message, string action)
            : base(message)
        {
            Code = code;
            Action = action;
        }

        public TechnicalException(string code, string message, string action, Exception inner)
            : base(message, inner)
        {
            Code = code;
            Action = action;
        }

        protected TechnicalException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            Action = info.GetString("Action");
            Code = info.GetString("Code");
            Reference = info.GetString("Reference");
        }

        public string Action { get; set; }
        public string Code { get; set; }
        public string Reference { get; set; }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            info?.AddValue("Action", Action);
            info?.AddValue("Code", Code);
            info?.AddValue("Reference", Reference);
            base.GetObjectData(info, context);
        }
    }
}