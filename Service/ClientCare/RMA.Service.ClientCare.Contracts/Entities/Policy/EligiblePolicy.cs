using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class EligiblePolicy
    {
        public int RolePlayerId { get; set; }
        public DateTime ClaimDate { get; set; }
        public List<int> EligibleProductIds { get; set; }
    }
}