using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AdditionalDocument
    {
        public int? ClaimId { get; set; } // ClaimId
        public string Email { get; set; } // DocumentToken
        public List<int> DocumentTypeIds { get; set; } // DocumentTypeId
        public Dictionary<string, string> Keys { get; set; }
        public string system { get; set; }
        public DocumentSetEnum DocumentSet { get; set; }
        public CommunicationTypeEnum CommunicationType { get; set; }
        public TemplateTypeEnum? TemplateType { get; set; }
        public int DocumentSetId
        {
            get => (int)DocumentSet;
            set => DocumentSet = (DocumentSetEnum)value;
        }
    }
}
