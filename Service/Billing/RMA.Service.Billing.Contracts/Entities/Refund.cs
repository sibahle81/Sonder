using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Refund
    {
        public decimal RefundAmount { get; set; }
        public DateTime RefundDate { get; set; }
        public Note Note { get; set; }
        public RefundTypeEnum? Trigger { get; set; }
        public RefundReasonEnum? RefundReason { get; set; }
        public List<int> TransactionIds { get; set; }
        public string RolePlayerName { get; set; }
        public int RolePlayerId { get; set; }
        public string FinPayeNumber { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
        public List<RefundTransaction> PartialRefundTransactions { get; set; }
        public string GroupEmail { get; set; }
        public string ClientEmail { get; set; }
        public List<Role> requiredApprovalRoles { get; set; }
        public List<int> RolesThatHaveApproved { get; set; }
        public string TempDocumentKeyValue { get; set; }
        public int RolePlayerBankingId { get; set; }
        public bool OverrideMembershipApprover { get; set; }
        public List<RefundRmaBankAccountAmount> RefundRmaBankAccountAmounts { get; set; }
        public decimal? DebtorClaimRecoveryBalance { get; set; }
        public int? RefundHeaderId { get; set; } 
    }
}
