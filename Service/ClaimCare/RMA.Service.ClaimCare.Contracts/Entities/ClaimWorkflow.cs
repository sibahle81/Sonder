using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimWorkflow
    {
        public int ClaimWorkflowId { get; set; }
        public int? WizardId { get; set; }
        public int? ClaimId { get; set; }
        public WorkPoolEnum? WorkPool { get; set; }
        public ClaimStatusEnum? ClaimStatus { get; set; }
        public int? AssignedToUserId { get; set; }
        public string Description { get; set; }
        public System.DateTime? StartDateTime { get; set; }
        public System.DateTime? EndDateTime { get; set; }

        public int ClaimStatusId
        {
            get => (int)ClaimStatus;
            set => ClaimStatus = (ClaimStatusEnum)value;
        }
    }
}
