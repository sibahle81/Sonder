using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class WizardPermissionOverride
    {
        public int WizardPermissionOverrideId { get; set; } // WizardPermissionOverrideId (Primary key)
        public int WizardId { get; set; } // WizardId
        public WizardPermissionTypeEnum WizardPermissionType { get; set; } // WizardPermissionTypeId
        public string PermissionName { get; set; } // PermissionName (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
    }
}