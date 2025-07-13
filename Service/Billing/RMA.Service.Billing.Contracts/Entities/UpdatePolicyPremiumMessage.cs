using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class UpdatePolicyPremiumMessage : ServiceBusMessageBase
    {
        public string ImpersonateUser { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public decimal OldPremiumAmount { get; set; }
        public decimal NewPremiumAmount { get; set; }
        public decimal AdjustmentPremium { get; set; }
        public DateTime? AdjustmentStartDate { get; set; }
        public int RolePlayerId { get; set; }
        public int? InvoiceId { get; set; }
        public int? TransactionId { get; set; }
        public string TransactionReason { get; set; }
    }
}
