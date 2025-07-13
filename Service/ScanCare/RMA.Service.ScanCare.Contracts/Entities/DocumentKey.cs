using System;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class DocumentKey
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string KeyName { get; set; }
        public string KeyValue { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
