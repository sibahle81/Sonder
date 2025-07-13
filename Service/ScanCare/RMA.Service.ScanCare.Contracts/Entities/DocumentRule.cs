using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class DocumentRule
    {
        public int Id { get; set; }
        public DeathTypeEnum DeathType { get; set; }
        public bool IsIndividual { get; set; }
        public int? EmailTemplateId { get; set; }
        public DocumentSetEnum? DocumentSet { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
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
