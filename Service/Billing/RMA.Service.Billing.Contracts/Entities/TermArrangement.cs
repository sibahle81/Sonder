using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermArrangement
    {
        public int TermArrangementId { get; set; } // TermArrangementId (Primary key)
        public string MemberName { get; set; }
        public string MemberNumber { get; set; }
        public decimal TotalAmount { get; set; } // TotalAmount
        public TermArrangementStatusEnum TermArrangementStatus { get; set; } // TermArrangementStatusId
        public PaymentMethodEnum PaymentMethod { get; set; } // PaymentMethodId
        public DateTime StartDate { get; set; } // StartDate
        public DateTime EndDate { get; set; } // EndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public DateTime? NotificationDate { get; set; } // NotificationDate
        public int TermMonths { get; set; } // TermMonths
        public decimal Balance { get; set; } // Balance
        public List<Note> TermsArrangementNotes { get; set; }
        public virtual List<TermArrangementSchedule> TermArrangementSchedules { get; set; } // TermArrangementSchedule.FK_TermArrangementSchedule_TermArrangement
        public DateTime? ApprovalDate { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal InvoiceBalance { get; set; }
        public int InstallmentDay { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public bool SendAgreementToClient { get; set; }
        public int? RolePlayerId { get; set; }
        public TermArrangementPaymentFrequencyEnum TermArrangementPaymentFrequency { get; set; } // TermArrangementPaymentFrequencyId
        public int? RolePlayerBankingId { get; set; }
        public TermApplicationDeclineReasonEnum? TermApplicationDeclineReason { get; set; }
        public List<string> NoAutoApprovalReasons { get; set; }
        public List<TermArrangementSubsidiary> TermArrangementSubsidiaries { get; set; }
        public List<TermFlexibleSchedule> TermFlexibleSchedules { get; set; }
        public bool? IsActive { get; set; }
        public List<TermArrangementProductOption> TermArrangementProductOptions { get; set; }
        public decimal? BalanceCarriedToNextCycle { get; set; }
        public int BankAccountId { get; set; }
        public int? LinkedTermArrangementId { get; set; } // LinkedTermArrangementId
        public int? NumberOfPayments { get; set; }

    }
}
