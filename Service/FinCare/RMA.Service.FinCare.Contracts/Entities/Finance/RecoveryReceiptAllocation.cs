namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RecoveryReceiptAllocation
    {
        public int RecoveryReceiptAllocationId { get; set; }
        public int RecoveryReceiptId { get; set; }
        public int PersonEventId { get; set; }
        public int ClaimId { get; set; }
        public decimal Amount { get; set; }
        public bool IsDeleted { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
    }
}
