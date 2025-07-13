using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ValidityCheckSet
    {
        public int Id { get; set; } // Id (Primary key)
        public ValidityCheckTypeEnum ValidityCheckType { get; set; } // ValidityCheckType
        public string Description { get; set; } // Description (length: 50)
        public string Tooltip { get; set; } // Tooltip (length: 100)
        public bool IsDeleted { get; set; } // IsDeleted
        public int ValidityCheckCategoryId { get; set; } // ValidityCheckCategoryId
    }
}
