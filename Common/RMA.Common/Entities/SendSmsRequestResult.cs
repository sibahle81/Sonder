namespace RMA.Common.Entities
{
    public class SendSmsRequestResult
    {
        public string SmsReference { get; set; }
        public bool IsSuccess { get; set; }
        public string ProcessDescription { get; set; }
        public string SmsNumber { get; set; }
    }
}
