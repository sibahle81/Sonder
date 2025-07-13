namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class MailAttachment
    {
        public string FileName { get; set; }
        public byte[] AttachmentByteData { get; set; }
        public string FileType { get; set; }
    }
}