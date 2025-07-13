namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    /// <summary>
    /// Encapsulates the various textual inputs needed for document classification.
    /// </summary>
    public class DocumentClassificationInput
    {
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public string AttachmentFileName { get; set; }
        public string AttachmentContent { get; set; }
        public int DocumentSystemNameId { get; set; }
    }

}
