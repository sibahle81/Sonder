using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterestIndicator
    {
        public int Id { get; set; }
        public DateTime InterestDateFrom { get; set; }
        public DateTime InterestDateTo { get; set; }
        public bool isActive { get; set; }
        public int RolePlayerId { get; set; }
        public bool? ChargeInterest { get; set; }
    }
}