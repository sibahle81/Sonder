using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionClawBackAccountMovement : AuditDetails
    {
        public int ClawBackAccountMovementId { get; set; }
        public int ClawBackAccountId { get; set; }
        public int HeaderId { get; set; }
        public CommissionPaymentTypeEnum CommissionPaymentType { get; set; }
        public decimal TotalDueAmount { get; set; }
        public decimal CurrentClawBackBalance { get; set; }
        public decimal NewClawBackBalance { get; set; }
    }
}