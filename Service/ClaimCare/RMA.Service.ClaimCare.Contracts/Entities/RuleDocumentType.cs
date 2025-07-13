using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class RuleDocumentType
    {
        public int Id { get; set; } // Id (Primary key)
        public int DocumentRuleId { get; set; } // DocumentRuleId
        public DocumentTypeEnum DocumentType { get; set; } // DocumentTypeId
        public bool IsRequired { get; set; } // isRequired

        //ENUM => ID Conversions
        public int DocumentTypeId
        {
            get => (int)DocumentType;
            set => DocumentType = (DocumentTypeEnum)value;
        }
    }
}