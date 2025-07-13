using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumPaybackItem
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime PolicyInceptionDate { get; set; }
        public int RolePlayerId { get; set; }
        public string PolicyOwner { get; set; }
        public string IdNumber { get; set; }
        public string MobileNumber { get; set; }
        public int PremiumPaybackId { get; set; }
        public DateTime? PaybackDate { get; set; }
        public DateTime? NotificationDate { get; set; }
        public PremiumPaybackStatusEnum PremiumPaybackStatus { get; set; }
        public decimal PaybackAmount { get; set; }
        public string PaybackFailedReason { get; set; }
        public int? RolePlayerBankingId { get; set; }
        public BankAccountTypeEnum? BankAccountType { get; set; }
        public string AccountNumber { get; set; }
        public int? BankId { get; set; }
        public int? BankBranchId { get; set; }
        public string BranchCode { get; set; }
    }
}
