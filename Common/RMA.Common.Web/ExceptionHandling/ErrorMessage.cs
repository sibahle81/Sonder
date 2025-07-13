namespace RMA.Common.Web.ExceptionHandling
{
    public class ErrorMessage
    {
        public ErrorMessage(string message)
        {
            Error = message;
        }

        public ErrorMessage(string message, string reference, string details)
        {
            Error = message;
            Reference = reference;
            Details = details;
        }

        public string Error { get; }
        public string Reference { get; set; }
        public string Details { get; }
    }
}