using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class Allocation : AuditDetails
    {
        public int AllocationId { get; set; } // AllocationId (Primary key)
        public int? PaymentId { get; set; } // PaymentId
        public int PayeeId { get; set; } // PayeeId
        public PaymentAllocationStatusEnum PaymentAllocationStatus { get; set; } // AllocationStatusId
        public int? ClaimInvoiceAllocationId { get; set; } // ClaimInvoiceAllocationId
        public int? MedicalInvoiceId { get; set; } // MedicalInvoiceId
        public int? DaysOffInvoiceId { get; set; } // DaysOffInvoiceId
        public int? MonthlyPensionLedgerId { get; set; } // MonthlyPensionLedgerId
        public int? CommutationId { get; set; } // CommutationId
        public int? OverPaymentId { get; set; } // OverPaymentId
        public int? PdAwardId { get; set; } // PDAwardId
        public decimal AssessedAmount { get; set; } // AssessedAmount
        public decimal AssessedVat { get; set; } // AssessedVAT
        public decimal? AssessedAmountInclusive { get; private set; } // AssessedAmountInclusive
        public PaymentTypeEnum? PaymentType { get; set; } // PaymentTypeId
        public string PensionCaseNumber { get; set; } // PensionCaseNumber
        public string BenefitCode { get; set; } // BenefitCode
        public int? LedgerId { get; set; } // LedgerId
        public Payment Payment { get; set; } // Payment

    }
}
