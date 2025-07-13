using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PolicyClaim : AuditDetails
    {
        public List<Claim> Claims { get; set; }
        public int policyCount { get; set; }
    }
}