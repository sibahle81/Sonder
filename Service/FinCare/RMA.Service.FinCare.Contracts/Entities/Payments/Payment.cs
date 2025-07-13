using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; } // PaymentStatusId
        public PaymentTypeEnum PaymentType { get; set; } // PaymentTypeId
        public int PayeeId { get; set; } // PayeeId
        public string Payee { get; set; } // PayeeDetails (length: 50)
        public string Bank { get; set; } // Bank (length: 50)
        public string BankBranch { get; set; } //BankBranch
        public string AccountNo { get; set; } // AccountDetails (length: 17)
        public decimal Amount { get; set; } // AmountPayable
        public decimal? RetainedCommission { get; set; } // RetainerFee
        public bool CanEdit { get; set; } // CanEdit
        public string Product { get; set; } // Product (length: 50)
        public string Company { get; set; } // CompanyCode
        public string Branch { get; set; } // BranchNo
        public string SenderAccountNo { get; set; } // SenderAccountDetails (length: 50)
        public int? BrokerCode { get; set; } // BrokerCode
        public string BrokerName { get; set; } // BrokerName (length: 50)
        public bool? FsbAccredited { get; set; } // FSBAccredited
        public string ErrorCode { get; set; } // ErrorCode (length: 10)
        public int MaxSubmissionCount { get; set; } // MaxSubmissionRetryCount
        public int SubmissionCount { get; set; } // SubmissionRetryCount
        public BankAccountTypeEnum? BankAccountType { get; set; } // BankAccountTypeId
        public ClaimTypeEnum? ClaimType { get; set; }
        public string IdNumber { get; set; } // IdNumber
        public string EmailAddress { get; set; } // EmailAddress
        public string ErrorDescription { get; set; } // ErrorDescription (length: 150)
        public DateTime? SubmissionDate { get; set; }
        public DateTime? PaymentConfirmationDate { get; set; }
        public DateTime? ClientNotificationDate { get; set; }
        public bool? CanResubmit { get; set; } // CanResubmit
        public PaymentRejectionTypeEnum? RejectionType { get; set; }
        public ClientTypeEnum? ClientType { get; set; }
        public string ClaimReference { get; set; }
        public string PolicyReference { get; set; }
        public string Reference { get; set; }
        public string BatchReference { get; set; }
        public int? PaymentSubmissonBatchid { get; set; } // PaymentSubmissonBatchid
        public DateTime? RejectionDate { get; set; }
        public DateTime? ReconciliationDate { get; set; }
        public List<FacsTransactionResult> FacsTransactionResults { get; set; } // FacsTransactionResults.FK_Payment_PaymentId
        public int? PolicyId { get; set; } // PolicyId
        public int? ClaimId { get; set; } // ClaimId 
        public int? PaymentInstructionId { get; set; } // PaymentInstructionId
        public int? RefundHeaderId { get; set; } // RefundHeaderId
        public bool IsBetweenTenAndTwo { get; set; } // RefundHeaderId
        public string TransactionType { get; set; }
        public string BankStatementReference { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public DateTime? RecalledDate { get; set; }
        public bool IsImmediatePayment { get; set; }
        //Below commented-out until we get feedback 
        //public List<Allocation> Allocations { get; set; } // Allocation.FK_Allocation_Payment
        public System.DateTime? StrikeDate { get; set; }
        public string MemberName { get; set; }
        public string MemberNumber { get; set; }
        public BenefitTypeEnum? BenefitType { get; set; }
        public string Scheme { get; set; }
        public bool? IsDebtorCheck { get; set; }
        public bool IsForex { get; set; }
        public int? AssignedTo { get; set; }
        public string UserName { get; set; }
        public int? UserId { get; set; }
        public int? DestinationCountryId { get; set; }
        public int? ClaimInvoiceTypeId { get; set; }
        public string PensionRef { get; set; }
        public string BenefitCode { get; set; }
        public string BankReference { get; set; }
        public bool? DoClaimRecovery { get; set; }
        public PaymentMethodEnum? PaymentMethod { get; set; }
        public bool IsReversed { get; set; }
        public int? ClaimInvoiceId { get; set; }
        public int? MedicalInvoiceId { get; set; }
        public string PensionCaseNumber { get; set; }
        public int? MonthlyPensionLedgerId { get; set; }
        public int? LedgerId { get; set; }
    }
}