using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ParentInsuranceType
    {
        public int ParentInsuranceTypeId { get; set; } // ParentInsuranceTypeID (Primary key)
        public string Code { get; set; } // Code (length: 50)
        public string Description { get; set; } // Description (length: 250)
        public EventTypeEnum EventType { get; set; } // EventTypeID
        public int AssurerId { get; set; } // AssurerID
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int EventTypeId
        {
            get => (int)EventType;
            set => EventType = (EventTypeEnum)value;
        }
    }
}