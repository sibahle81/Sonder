using System.Collections.Generic;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class StartWizardRequest
    {
        public string Type { get; set; }
        public int LinkedItemId { get; set; }
        public string Data { get; set; }
        public string LockedToUser { get; set; }
        public string CustomStatus { get; set; }
        public int CustomRoutingRoleId { get; set; }
        public bool RequestInitiatedByBackgroundProcess { get; set; }
        public bool AllowMultipleWizards { get; set; }
        public System.DateTime? OverrideStartDateAndTime { get; set; }
        public List<WizardPermissionOverride> WizardPermissionOverrides { get; set; }
    }
}