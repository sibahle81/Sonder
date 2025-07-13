using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class FuneralInvoice : AuditDetails
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 10)
        public decimal? RefundAmount { get; set; } // RefundAmount
        public decimal? OutstandingPremiumAmount { get; set; } // OutstandingPremiumAmount
        public decimal? UnclaimedPaymentInterest { get; set; } // UnclaimedPaymentInterest
        public decimal? TracingFees { get; set; } // TracingFees
        public decimal? CapAmount { get; set; } // CapAmount
        public decimal? CoverAmount { get; set; } // CoverAmount
        public ClaimInvoiceDecisionEnum? ClaimInvoiceDecision { get; set; } // ClaimInvoiceDecisionId
        public ClaimInvoiceDeclineReasonEnum? ClaimInvoiceDeclineReason { get; set; } // ClaimInvoiceDeclineReasonId
        public ClaimInvoiceReversalReasonEnum? ClaimInvoiceReversalReason { get; set; } // ClaimInvoiceReversalReasonId
        public decimal? AllocationPercentage { get; set; } // AllocationPercentage
        public string DecisionNote { get; set; } // DecisionNote
        public int? BankAccountId { get; set; } // BankAccountId
        public new bool IsDeleted { get; set; } // IsDeleted
        public new string CreatedBy { get; set; } // CreatedBy (length: 50)
        public new System.DateTime CreatedDate { get; set; } // CreatedDate
        public new string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public new System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
