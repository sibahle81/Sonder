using System.Collections.Generic;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class WizardConfiguration
    {
        public WizardConfiguration()
        {
            ApprovalPermissions = new List<string>();
            StartPermissions = new List<string>();
            ContinuePermissions = new List<string>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public List<string> ApprovalPermissions { get; set; }
        public List<string> StartPermissions { get; set; }
        public List<string> ContinuePermissions { get; set; }
        public int? SlaWarning { get; set; } // SLAWarning
        public int? SlaEscalation { get; set; } // SLAEscalation
        public int? UserSlaWarning { get; set; } // UserSLAWarning
        public int? UserSlaEscalation { get; set; } // UserSLAEscalation
        public bool AllowEditOnApproval { get; set; }
        public bool IsOverridable { get; set; }
        public bool IsNotification { get; set; }
        public bool CanReAssign { get; set; }
        public List<WizardPermission> WizardPermissions { get; set; }
    }
}