using RMA.Common.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentModel : AuditDetails
    {
        public int PaymentId { get; set; }
        public int PaymentStatus { get; set; } // PaymentStatusId
        public int PaymentType { get; set; } // PaymentTypeId
        public string Payee { get; set; } // PayeeDetails (length: 50)
        public string Bank { get; set; } // Bank (length: 50)
        public string BankBranch { get; set; } //BankBranch
        public string AccountNo { get; set; } // AccountDetails (length: 17)
        public decimal Amount { get; set; } // AmountPayable
        public decimal? RetainedCommission { get; set; } // RetainerFee
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
        public int? BankAccountType { get; set; } // BankAccountTypeId
        public int? ClaimType { get; set; }
        public string IdNumber { get; set; } // IdNumber
        public string EmailAddress { get; set; } // EmailAddress
        public string ErrorDescription { get; set; } // ErrorDescription (length: 150)
        public DateTime? SubmissionDate { get; set; }
        public DateTime? PaymentConfirmationDate { get; set; }
        public DateTime? ClientNotificationDate { get; set; }
        public bool? CanResubmit { get; set; } // CanResubmit
        public int? RejectionType { get; set; }
        public int? ClientType { get; set; }
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
    }
}