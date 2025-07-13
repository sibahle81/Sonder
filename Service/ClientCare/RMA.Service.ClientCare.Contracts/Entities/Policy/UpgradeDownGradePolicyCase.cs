using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class UpgradeDownGradePolicyCase
    {
        public string Code { get; set; }
        public int PolicyId { get; set; }
        public DateTime EffectiveDate { get; set; }
        public ChangePolicyOption ProductOption { get; set; }
        public List<ChangePolicyOption> Benefits { get; set; }
        public bool SelectAllPolicies { get; set; }
        public List<int> SelectedPolicyIds { get; set; }
    }
}
