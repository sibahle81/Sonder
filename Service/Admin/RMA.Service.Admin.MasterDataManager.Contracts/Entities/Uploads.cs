using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Uploads
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string MimeType { get; set; }
        public string Size { get; set; }
        public byte[] Data { get; set; }
        public Guid Token { get; set; }

        public string Url { get; set; }
        public bool HasUploaded { get; set; }
        public int? ImportId { get; set; }
        public string Message { get; set; }
        public string DocumentType { get; set; }
    }
}