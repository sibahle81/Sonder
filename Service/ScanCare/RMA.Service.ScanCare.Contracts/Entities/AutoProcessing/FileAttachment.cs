namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    public class FileAttachment
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public byte[] Content { get; set; }
        public string ContentType { get; set; }
    }
}
