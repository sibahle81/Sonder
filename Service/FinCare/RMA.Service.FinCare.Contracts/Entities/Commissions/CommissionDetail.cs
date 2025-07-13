using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionDetail : AuditDetails
    {
        public int DetailId { get; set; }
        public int HeaderId { get; set; }
        public int InvoicePaymentAllocationId { get; set; }
        public string InvoiceNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string RepCode { get; set; }
        public string RepName { get; set; }
        public decimal AllocatedAmount { get; set; }
        public double CommissionPercentage { get; set; }
        public double AdminPercentage { get; set; }
        public string CommissionFormula { get; set; }
        public decimal CommissionAmount { get; set; }
        public string AdminServiceFeeFormula { get; set; }
        public decimal AdminServiceFeeAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public CommissionInvoicePaymentAllocation InvoicePaymentAllocation { get; set; }
    }
}
