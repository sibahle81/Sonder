using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRecovery : AuditDetails
    {
        public int ClaimRecoveryId { get; set; } // ClaimRecoveryId (Primary key)
        public int ClaimId { get; set; } // ClaimId (Primary key)
        public int ClaimNumber { get; set; } // ClaimReference (length: 50)
        public ClaimStatusEnum? ClaimStatus { get; set; } // ClaimStatusId
        public string RecoveryInvokedBy { get; set; } // RecoveryInvokedBy (length: 50)
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public int RolePlayerBankingId { get; set; } // RolePlayerBankingId (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public decimal? RecoveryAmount { get; set; } // RecoveryAmount
        public decimal? RecoveredAmount { get; set; } // RecoveryAmount
        public int InvoiceId { get; set; } // InvoiceId (Primary key)
        public int TransactionId { get; set; } // TransactionId (Primary key)
        public string FinPayeeNumber { get; set; } // FinPayeeNumber (length: 50)
        public string PaymentPlan { get; set; } // PaymentPlan (length: 50)
        public int? PaymentDay { get; set; } // PaymentDay

        //ENUM => ID Conversions
        public int ClaimStatusId
        {
            get => (int)ClaimStatus;
            set => ClaimStatus = (ClaimStatusEnum)value;
        }
        public WorkPoolEnum? WorkPool { get; set; }
        public int ClaimRecoveryInvoiceId { get; set; }
        public string ClaimStatusDisplayName { get; set; }
        public string ClaimStatusDisplayDescription { get; set; }
        public ClaimRecoveryReasonEnum? ClaimRecoveryReason { get; set; }
    }
}