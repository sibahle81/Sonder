using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Refund
    {
        public RolePlayerPolicy Policy { get; set; }
        public decimal RefundAmount { get; set; }
        public DateTime RefundDate { get; set; }
        public Note Note { get; set; }
        public RefundTypeEnum? Trigger { get; set; }
        public RefundReasonEnum? RefundReason { get; set; }
        public List<int> TransactionIds { get; set; }
        public string RolePlayerName { get; set; }
        public int RolePlayerId { get; set; }
        public string RequestCode { get; set; }
        public string FinPayeNumber { get; set; }
        public PeriodStatusEnum PeriodStatus { get; set; } = PeriodStatusEnum.Current;
        public List<RefundTransaction> PartialRefundTransactions { get; set; }
        public string RefundBankAccountNumber { get; set; }
        public string RefundBankBranchCode { get; set; }
        public string GroupEmail { get; set; }
        public string ClientEmail { get; set; }
        public List<Role> requiredApprovalRoles { get; set; }
        public List<int> RolesThatHaveApproved { get; set; }
        public int? RefundBankBranchId { get; set; }
        public string RefundBankAccountHolder { get; set; }
        public int RefundBankId { get; set; }
        public BankAccountTypeEnum RefundAccountType { get; set; }
        public string TempDocumentKeyValue { get; set; }
        public int RolePlayerBankingId { get; set; }
        public bool OverrideMembershipApprover { get; set; }
    }
}
