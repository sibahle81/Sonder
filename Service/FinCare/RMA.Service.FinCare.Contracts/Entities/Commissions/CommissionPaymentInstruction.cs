using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionPaymentInstruction : AuditDetails
    {
        public int PaymentInstructionId { get; set; }
        public int HeaderId { get; set; }
        public CommissionPaymentTypeEnum CommissionPaymentType { get; set; }
        public decimal Amount { get; set; }
        public CommissionStatusEnum Status { get; set; }
        public string Results { get; set; }
    }
}
