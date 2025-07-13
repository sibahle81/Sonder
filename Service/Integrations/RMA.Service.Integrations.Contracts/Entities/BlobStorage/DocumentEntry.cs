using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.BlobStorage
{
    public class DocumentEntry
    {
        public string FileName { get; set; }
        public string DocumentTypeName { get; set; }
        public IDictionary<string, string> DocumentKeys { get; set; }
        public byte[] Data { get; set; }
        public string SystemName { get; set; }
    }
}