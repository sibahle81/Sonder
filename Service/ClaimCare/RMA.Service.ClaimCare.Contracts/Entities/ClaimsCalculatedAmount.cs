namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimsCalculatedAmount
    {
        public int ClaimsCalculatedAmountId { get; set; }
        public int ClaimId { get; set; }
        public decimal RefundAmount { get; set; }
        public decimal OutstandingPremiumAmount { get; set; }
        public decimal? TracingFee { get; set; }
        public decimal CapAmount { get; set; } // CapAmount
        public decimal CoverAmount { get; set; } // CoverAmount
        public decimal? UnclaimedPaymentInterest { get; set; } // UnclaimedPaymentInterest
        public decimal AllocationPercentange { get; set; } // AllocationPercentange
        public string ValidationReason { get; set; } // ValidationReason (length: 150)
        public decimal TotalAmount { get; set; } // TotalAmount
        public System.DateTime? UnclaimedStartDate { get; set; } // UnclaimedStartDate
        public System.DateTime? UnclaimedEndDate { get; set; } // UnclaimedEndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}