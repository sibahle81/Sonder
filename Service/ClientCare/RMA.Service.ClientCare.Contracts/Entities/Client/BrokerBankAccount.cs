using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class BrokerBankAccount : AuditDetails
    {
        public int BankBranchId { get; set; }
        public string AccountNumber { get; set; }
        public BankAccountTypeEnum BankAccountType { get; set; }
        public string AccountHolderName { get; set; }
        public string BranchCode { get; set; }
        public string ApprovalRequestedFor { get; set; }
        public int? ApprovalRequestId { get; set; }
        public bool? IsApproved { get; set; }
        public string Reason { get; set; }

        public DateTime? EffectiveDate { get; set; }
    }
}
