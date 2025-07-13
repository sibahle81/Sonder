using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class InjurySeverity
    {
        public InjurySeverityTypeEnum InjurySeverityType { get; set; } // InjurySeverityID (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 250)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 30)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int InjurySeverityTypeId
        {
            get => (int)InjurySeverityType;
            set => InjurySeverityType = (InjurySeverityTypeEnum)value;
        }
    }
}