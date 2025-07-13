using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RefundHeaderDetail : AuditDetails
    {
        public int ClientCoverId { get; set; }
        public int RefundHeaderId { get; set; }
        public decimal Amount { get; set; }
        public int StatusId { get; set; }
        public string RejectReason { get; set; }
        public bool IsReconciled { get; set; }
        public string Status { get; set; }
        public string DocumentNumber { get; set; }
        public string Description { get; set; }
        public virtual RefundHeader RefundHeader { get; set; }
    }
}
