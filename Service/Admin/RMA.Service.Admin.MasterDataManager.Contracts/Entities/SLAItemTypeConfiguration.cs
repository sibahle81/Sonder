
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SlaItemTypeConfiguration
    {
        public int SlaItemTypeConfigurationId { get; set; } // SLAItemTypeConfigurationId (Primary key)
        public SLAItemTypeEnum SLAItemType { get; set; } // SLAItemTypeId
        public int? NumberOfDaysAmberSla { get; set; } // NumberOfDaysAmberSLA
        public int? NumberOfDaysRedSla { get; set; } // NumberOfDaysRedSLA
        public string RedSlaNotificationPermission { get; set; } // RedSLANotificationPermission (length: 50)
        public string AmberSlaNotificationPermission { get; set; } // AmberSLANotificationPermission (length: 50)
        public bool? IncludeEmailNotificationAmberSla { get; set; } // IncludeEmailNotificationAmberSLA
        public bool? IncludeEmailNotificationRedSla { get; set; } // IncludeEmailNotificationRedSLA
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}