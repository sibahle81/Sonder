using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities.Payments
{
    public class UnallocatedPayment
    {
        public int UnallocatedPaymentId { get; set; }
        public int BankImportId { get; set; }
        public AllocationProgressStatusEnum? AllocationProgressStatus { get; set; }
        public decimal UnallocatedAmount { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public int? RoleplayerId { get; set; }
        public int BankStatementEntryId { get; set; }
    }
}
