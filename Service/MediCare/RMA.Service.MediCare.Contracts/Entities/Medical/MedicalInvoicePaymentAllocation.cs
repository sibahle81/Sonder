using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalInvoicePaymentAllocation : AuditDetails
    {
        public int AllocationId { get; set; } // AllocationId (Primary key)
        public int PayeeId { get; set; } // PayeeId
        public PaymentAllocationStatusEnum PaymentAllocationStatus { get; set; } // AllocationStatusId
        public int? MedicalInvoiceId { get; set; } // MedicalInvoiceId
        public int? TebaInvoiceId { get; set; } // TebaInvoiceId
        public int? DaysOffInvoiceId { get; set; } // DaysOffInvoiceId
        public int? PdAwardId { get; set; } // PDAwardId
        public decimal AssessedAmount { get; set; } // Amount
        public decimal AssessedVat { get; set; } // Amount
        public PaymentTypeEnum? PaymentType { get; set; } // PaymentTypeId
    }
}
