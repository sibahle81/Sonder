using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Payments;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RecoveryReceiptDeduction
    {
        public int RecoveryReceiptDeductionId { get; set; }
        public int RecoveryReceiptId { get; set; }
        public RecoveryReceiptDeductionTypeEnum RecoveryReceiptDeductionType { get; set; }
        public string Description { get; set; }
        public int PayeeId { get; set; }
        public decimal Amount { get; set; }
        public int PaymentId { get; set; }
        public bool IsDeleted { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }

        public Payment Payment { get; set; }
    }
}
