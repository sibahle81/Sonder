﻿using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentErrorAudit
    {
        public int PaymentErrorAuditId { get; set; } // PaymentErrorAuditId (Primary key)
        public int? ClaimId { get; set; } // ClaimId
        public int? PaymentId { get; set; } // PaymentId
        public int? PolicyId { get; set; } // PolicyId
        public int? PaymentInstructionId { get; set; } // PaymentInstructionId
        public int? RefundHeaderId { get; set; } // RefundHeaderId
        public bool CanEdit { get; set; } // CanEdit
        public PaymentStatusEnum? PaymentStatus { get; set; } // PaymentStatusId
        public PaymentTypeEnum? PaymentType { get; set; } // PaymentTypeId
        public string Payee { get; set; } // Payee (length: 80)
        public string Bank { get; set; } // Bank (length: 50)
        public string BankBranch { get; set; } // BankBranch (length: 10)
        public string AccountNo { get; set; } // AccountNo (length: 17)
        public decimal Amount { get; set; } // Amount
        public decimal? RetainedCommission { get; set; } // RetainedCommission
        public string Product { get; set; } // Product (length: 100)
        public string Company { get; set; } // Company (length: 10)
        public string Branch { get; set; } // Branch (length: 10)
        public string SenderAccountNo { get; set; } // SenderAccountNo (length: 17)
        public int? BrokerCode { get; set; } // BrokerCode
        public string BrokerName { get; set; } // BrokerName (length: 80)
        public bool? FsbAccredited { get; set; } // FSBAccredited
        public string ErrorCode { get; set; } // ErrorCode (length: 50)
        public int? MaxSubmissionCount { get; set; } // MaxSubmissionCount
        public int? SubmissionCount { get; set; } // SubmissionCount
        public BankAccountTypeEnum? BankAccountType { get; set; } // BankAccountTypeId
        public string IdNumber { get; set; } // IdNumber (length: 13)
        public string EmailAddress { get; set; } // EmailAddress (length: 100)
        public ClaimTypeEnum? ClaimType { get; set; } // ClaimTypeId
        public string ErrorDescription { get; set; } // ErrorDescription (length: 150)
        public System.DateTime? SubmissionDate { get; set; } // SubmissionDate
        public System.DateTime? PaymentConfirmationDate { get; set; } // PaymentConfirmationDate
        public System.DateTime? ClientNotificationDate { get; set; } // ClientNotificationDate
        public bool? CanResubmit { get; set; } // CanResubmit
        public PaymentRejectionTypeEnum? PaymentRejectionType { get; set; } // PaymentRejectionTypeId
        public ClientTypeEnum? ClientType { get; set; } // ClientTypeId
        public string ClaimReference { get; set; } // ClaimReference (length: 250)
        public string PolicyReference { get; set; } // PolicyReference (length: 250)
        public string Reference { get; set; } // Reference (length: 250)
        public string BatchReference { get; set; } // BatchReference (length: 250)
        public int? PaymentSubmissonBatchid { get; set; } // PaymentSubmissonBatchid
        public System.DateTime? ReconciliationDate { get; set; } // ReconciliationDate
        public System.DateTime? RejectionDate { get; set; } // RejectionDate
        public string TransactionType { get; set; } // TransactionType (length: 20)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool? IsImmediatePayment { get; set; } // IsImmediatePayment
        public System.DateTime? RecalledDate { get; set; } // RecalledDate
    }
}
