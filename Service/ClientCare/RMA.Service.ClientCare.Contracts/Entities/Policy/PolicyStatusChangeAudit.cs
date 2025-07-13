using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyStatusChangeAudit
    {
        public int PolicyStatusChangeAuditId { get; set; }
        public int PolicyId { get; set; }
        public PolicyStatusEnum PolicyStatus { get; set; }
        public string Reason { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public System.DateTime? EffectiveTo { get; set; }
        public string RequestedBy { get; set; }
        public System.DateTime RequestedDate { get; set; }

        public Policy Policy { get; set; }
        public List<Policy> VapsPolicies { get; set; }
    }
}
