using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RMA.Common.Database.Repository
{
    [Serializable]
    public class EfValidationException : Exception
    {
        private const string ErrorMessage = "Entity framework validation errors have occured";

        public EfValidationException(List<EfValidationError> errors)
            : base(ErrorMessage)
        {
            ValidationErrors = errors;
        }

        public EfValidationException() : base()
        {
        }

        public EfValidationException(string message) : base(message)
        {
        }

        public EfValidationException(string message, Exception innerException) : base(message, innerException)
        {
        }

        public List<EfValidationError> ValidationErrors { get; set; }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            if (info == null) throw new ArgumentNullException(nameof(info), "info is null");
            info.AddValue("ValidationErrors", ValidationErrors);
            base.GetObjectData(info, context);
        }
    }

    [Serializable]
    public class EfValidationError
    {
        public string Message { get; set; }
        public string PropertyName { get; set; }
    }
}