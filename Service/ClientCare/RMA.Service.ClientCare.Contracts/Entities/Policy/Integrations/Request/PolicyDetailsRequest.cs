using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class PolicyDetailsRequest
    {
        public string PolicyNumber { get; set; }
        public string PolicyStatus { get; set; }
        public DateTime InceptionDate { get; set; }

        public DateTime? IEndDate { get; set; }

        public decimal PolicyCoverAmountOrBenefit { get; set; }
        public decimal MemberCoverAmountOrBenefit { get; set; }



    }
}
