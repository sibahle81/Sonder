using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class DocumentGeneratorAudit
    {

        public int Id { get; set; }
        public Guid RequestId { get; set; }
        public int DocumentTemplateId { get; set; }
        public string Request { get; set; }
        public bool IsValidated { get; set; }
        public string RequestedBy { get; set; }
        public DateTime TimeStamp { get; set; }

    }
}
