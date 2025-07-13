using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RefundHeader : AuditDetails
    {
        public string Reference { get; set; }
        public decimal TotalRefundAmount { get; set; }
        public string ClientId { get; set; }
        public string Client { get; set; }
        public int StatusId { get; set; }
        public string RejectReason { get; set; }
        public bool IsReconciled { get; set; }
        public string BankName { get; set; }
        public string BranchCode { get; set; }
        public string BankAccount { get; set; }


    }
}
