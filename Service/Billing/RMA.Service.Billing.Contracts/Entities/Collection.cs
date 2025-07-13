using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class Collection
    {
        public int CollectionsId { get; set; } // CollectionsId (Primary key)
        public int? InvoiceId { get; set; } // InvoiceId
        public string BankReference { get; set; } // BankReference (length: 255)
        public CollectionTypeEnum CollectionType { get; set; } // CollectionTypeId
        public decimal Amount { get; set; } // Amount
        public CollectionStatusEnum CollectionStatus { get; set; } // CollectionStatusId
        public int? RolePlayerBankingId { get; set; } // RolePlayerBankingId
        public bool IsDeleted { get; set; } // IsDeleted
        public bool IsActive { get; set; } // IsActive
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ErrorCode { get; set; } // ErrorCode (length: 50)
        public int? MaxSubmissionCount { get; set; } // MaxSubmissionCount
        public int? SubmissionCount { get; set; } // SubmissionCount
        public string BatchReference { get; set; } // BatchReference (length: 250)
        public int? PolicyId { get; set; } // PolicyId
        public System.DateTime? SubmissionDate { get; set; } // SubmissionDate
        public System.DateTime? CollectionConfirmationDate { get; set; } // CollectionConfirmationDate
        public bool? CanResubmit { get; set; } // CanResubmit
        public CollectionRejectionTypeEnum? CollectionRejectionType { get; set; } // CollectionRejectionTypeId
        public System.DateTime? RejectionDate { get; set; } // RejectionDate
        public System.DateTime? ReconciliationDate { get; set; } // ReconciliationDate
        public string ErrorDescription { get; set; } // ErrorDescription (length: 150)
        public int? CollectionBatchId { get; set; } // CollectionBatchId

        public List<FacsTransactionResult> FacsTransactionResults { get; set; } // FacsTransactionResults.FK_FacsTransactionResults_Collections

        public CollectionBatch CollectionBatch { get; set; } // FK_Collections_CollectionBatch

        public Invoice Invoice { get; set; } // FK_Collections_Invoice

        public string AccountNo { get; set; }

        public string Bank { get; set; }

        public string BankBranch { get; set; }

        public string Debtor { get; set; }
        public System.DateTime? ReversalDate { get; set; } // ReversalDate
        public int? AdhocPaymentInstructionId { get; set; } // AdhocPaymentInstructionId
        public AdhocPaymentInstruction AdhocPaymentInstruction { get; set; }
        public System.DateTime DebitOrderDate { get; set; }
        public int? TermArrangementScheduleId { get; set; }
        public TermArrangementSchedule TermArrangementSchedule { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public CollectionsDebtorBankAccountSourceEnum? CollectionsDebtorBankAccountSource { get; set; }
        public string SubmittedClientAccount { get; set; }

    }
}
