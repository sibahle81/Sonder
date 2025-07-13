using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimPayment : AuditDetails
    {
        public int BeneficiaryId { get; set; } // BeneficiaryId --
        public int? PaymentId { get; set; } // PaymentId --
        public int ClaimId { get; set; } // ClaimId  --
        public decimal? ClaimAmount { get; set; } // ClaimAmount --
        public decimal? Refund { get; set; } // Refund --
        public int? ClaimStatusId { get; set; }
        public decimal? OutstandingPremium { get; set; } // OutstandingPremium --
        public int? DecisionReasonId { get; set; } // DecisionReasonId --
        public ClaimInvoiceDecisionEnum? Decision { get; set; } // --
        public string DecisionType => Decision.DisplayAttributeValue();
        public string ClaimReferenceNumber { get; set; } // ClaimReferenceNumber (length: 250)
        public int PolicyId { get; set; } // PolicyId
        public string PolicyNumber { get; set; } // PolicyNumber (length: 250)
        public System.DateTime CapturedDate { get; set; } // CapturedDate --
        public int? ProductId { get; set; } // ProductId
        public string Product { get; set; } // Product (length: 250)
        public List<Beneficiary> BeneficiaryDetails { get; set; }
        public Beneficiary BeneficiaryDetail { get; set; }
        public string MessageText { get; set; }
        public int? BankAccountId { get; set; } // BankAccountId
        public decimal? UnclaimedPaymentInterest { get; set; } // UnclaimedPaymentInterest
        public decimal? TracingFees { get; set; } // TracingFees
        public decimal? CapAmount { get; set; } // CapAmount
        public decimal? CoverAmount { get; set; } // CoverAmount
        public string ClaimantEmail { get; set; }

        //ENUM => ID Conversions
        public int? DecisionId
        {
            get => (int?)Decision;
            set => Decision = (ClaimInvoiceDecisionEnum?)value;
        }
        public ClaimInvoiceDeclineReasonEnum? ClaimInvoiceDeclineReason { get; set; }
        public int ClaimInvoiceId { get; set; }
        public int? RolePlayerBankingId { get; set; }
        public ClaimInvoiceReversalReasonEnum? ClaimInvoiceReversalReason { get; set; }
    }
}
