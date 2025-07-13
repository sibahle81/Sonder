using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyData
    {
        public string FSPNumber { get; set; }
        public string RepresentativeIdNumber { get; set; }
        public string ProductOptionCode { get; set; } = "";
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string ParentPolicyNumber { get; set; }
        public string ClientReference { get; set; }   //Policy Number from  MI Insight
        public decimal InstallmentPremium { get; set; }
        public List<PolicyDataMember> PolicyMembers { get; set; }   // Nimble members & Simply employees

        public bool AssignBenefit { get; set; }
    }
}
