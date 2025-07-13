namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class WizardApprovalStage
    {
        public int WizardApprovalStageId { get; set; } // WizardApprovalStageId (Primary key)
        public int WizardId { get; set; } // WizardId (Primary key)
        public int Stage { get; set; } // Stage (Primary key)
        public int StatusId { get; set; } // StatusId (Primary key)
        public int RoleId { get; set; } // RoleId (Primary key)
        public bool IsActive { get; set; } // IsActive (Primary key)
        public string Reason { get; set; } // Reason (length: 500)
        public string ActionedBy { get; set; }
        public System.DateTime? ActionedDate { get; set; } // ActionedDate
        public string StatusName { get; set; }
    }
}
