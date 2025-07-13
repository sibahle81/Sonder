namespace RMA.Common.Entities
{
    public class MailAttachment
    {
        public string FileName { get; set; }
        public byte[] AttachmentByteData { get; set; }
        public string FileType { get; set; }
        public string DocumentUri { get; set; }
        public bool SkipSaveAttachment { get; set; }
    }
}