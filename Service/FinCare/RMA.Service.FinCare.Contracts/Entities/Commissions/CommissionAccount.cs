using System;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionAccount
    {
        public Int16 AccountTypeId { get; set; } //to do enum ===>>> //1 = Brokerage, 2 = Juristic
        public string AccountTypeName { get; set; }
        public int AccountId { get; set; } //BrokerId or JuristicRepId
        public string AccountCode { get; set; }
        public string AccountName { get; set; }
        public string IdentificationNumber { get; set; }
        public decimal TotalPendingRelease { get; set; }
        public decimal TotalSubmitted { get; set; }
        public decimal TotalWithHeld { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal TotalRejected { get; set; }
        public decimal ClawBackAccountBalance { get; set; }
    }
}
