using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class AdhocPaymentInstruction
    {
        public int AdhocPaymentInstructionId { get; set; } // AdhocPaymentInstructionId (Primary key)
        public System.DateTime DateToPay { get; set; } // DateToPay
        public AdhocPaymentInstructionStatusEnum AdhocPaymentInstructionStatus { get; set; } // AdhocPaymentInstructionStatusId
        public string Reason { get; set; } // Reason (length: 50)
        public decimal Amount { get; set; } // Amount
        public int RolePlayerId { get; set; } // RolePlayerId
        public string RolePlayerName { get; set; } // RolePlayerName (length: 255)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public string FinPayeNumber { get; set; }
        public string ErrorDescription { get; set; }
        public System.DateTime BankAccountEffectiveDate { get; set; }
        public string BankAccountNumber { get; set; }
        public string BankAccountType { get; set; }
        public string BankAccountHolder { get; set; }
        public string BankBranchCode { get; set; }
        public string Bank { get; set; }
        public bool IsInitiatedByDebitOrderGenerationProcess { get; set; }
        public int? PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public List<int> TargetedTermArrangementScheduleIds { get; set; }
        public int? RolePlayerBankingId { get; set; } // RolePlayerBankingId
        public string TempDocumentKeyValue { get; set; }
    }
}
