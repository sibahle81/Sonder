using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimDocumentRequest
    {
        public string RequestText { get; set; }
        public DocumentSetEnum DocumentSet { get; set; }
        public List<DocumentTypeEnum> DocumentTypeFilter { get; set; }
        public List<DocumentTypeEnum> ForceRequiredDocumentTypeFilter { get; set; }
        public string KeyName { get; set; }
        public string KeyValue { get; set; }
        public string RequestedBy { get; set; }
        public DateTime RequestedDate { get; set; }
        public int PersonEventId { get; set; }
    }
}