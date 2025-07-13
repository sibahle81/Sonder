namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    public class EmailFileAttachment
    {
        public FileAttachment Attachment { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public string SystemName { get; set; }
    }
}
