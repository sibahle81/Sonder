using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Workflow : Common.Entities.AuditDetails
    {
        public int WorkflowId { get; set; }
        public int? WizardId { get; set; }
        public int? ReferenceId { get; set; }
        public string ReferenceType { get; set; }
        public WorkPoolEnum? WorkPool { get; set; }
        public int? AssignedToRoleId { get; set; }
        public int? AssignedToUserId { get; set; }
        public string Description { get; set; }
        public System.DateTime? StartDateTime { get; set; }
        public System.DateTime? EndDateTime { get; set; }
        public string WizardURL { get; set; }
        public int? LockedToUserId { get; set; }
    }
}
