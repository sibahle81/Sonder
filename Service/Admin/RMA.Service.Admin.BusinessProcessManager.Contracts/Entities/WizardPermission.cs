using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class WizardPermission
    {
        public int Id { get; set; } // Id (Primary key)
        public int WizardConfigurationId { get; set; } // WizardConfigurationId
        public WizardPermissionTypeEnum WizardPermissionType { get; set; } // WizardPermissionTypeId
        public string PermissionName { get; set; } // PermissionName (length: 50)
    }
}