using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DocumentRule
    {
        public int Id { get; set; } // Id (Primary key)
        public DeathTypeEnum DeathType { get; set; } // DeathTypeId
        public int? EmailTemplateId { get; set; } // EmailTemplateId
        public DocumentSetEnum DocumentSet { get; set; } // RuleDocumentTypeId
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public bool IsIndividual { get; set; } // isIndividual

        //ENUM => ID Conversions
        public int DeathTypeId
        {
            get => (int)DeathType;
            set => DeathType = (DeathTypeEnum)value;
        }

        public int DocumentSetId
        {
            get => (int)DocumentSet;
            set => DocumentSet = (DocumentSetEnum)value;
        }

    }
}