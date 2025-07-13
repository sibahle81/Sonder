using System;
using System.Runtime.Serialization;

namespace RMA.Common.Exceptions
{
    [Serializable]
    public class PermissionException : Exception
    {
        public string Action { get; set; }

        public PermissionException()
        {

        }

        public PermissionException(string message, string action = "")
            : base(message)
        {
            this.Action = action;
        }
        public PermissionException(string message, Exception innerException) : base(message, innerException)
        {
        }
        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            info?.AddValue("Action", Action);
            base.GetObjectData(info, context);
        }

        protected PermissionException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            Action = info.GetString("Action");
        }

    }
}
