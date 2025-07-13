using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RolePlayerItemQueryItemTypeWizard : AuditDetails
    {
        public RolePlayerQueryItemTypeEnum RolePlayerQueryItemType { get; set; }
        public int WizardConfigurationId { get; set; }
    }
}
