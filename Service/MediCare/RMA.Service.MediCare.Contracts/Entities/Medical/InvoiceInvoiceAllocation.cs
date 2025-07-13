using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalInvoiceAllocation
    {
        public int InvoiceAllocationId { get; set; } // InvoiceAllocationId (Primary key)
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId
        public int BeneificaryRolePlayerId { get; set; } // BeneificaryRolePlayerId
        public decimal AssessedAmount { get; set; } // AssessedAmount
        public decimal AssessedVat { get; set; } // AssessedVat
        public PaymentMethodEnum? PaymentMethod { get; set; } // PaymentMethodId
        public decimal PercentAllocation { get; set; } // PercentAllocation
        public int AllocationGroup { get; set; } // AllocationGroup
        public int InvoiceAllocationStatusId { get; set; } // InvoiceAllocationStatusId
        public int InvoiceTypeId { get; set; } // InvoiceTypeId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public int? PaymentMethodId
        {
            get => (int?)PaymentMethod;
            set => PaymentMethod = (PaymentMethodEnum?)value;
        }
        public int RolePlayerBankingId { get; set; }
    }
}
