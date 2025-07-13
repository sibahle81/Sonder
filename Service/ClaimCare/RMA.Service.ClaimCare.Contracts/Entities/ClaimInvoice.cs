using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimInvoice : AuditDetails
    {
        public ClaimInvoice()
        {
            InvoiceAllocations = new List<InvoiceAllocation>();
        }

        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public int ClaimId { get; set; } // ClaimId
        public ClaimInvoiceTypeEnum ClaimInvoiceType { get; set; } // ClaimInvoiceTypeId
        public int ClaimBenefitId { get; set; } // ClaimBenefitId
        public System.DateTime DateReceived { get; set; } // DateReceived
        public System.DateTime? DateSubmitted { get; set; } // DateSubmitted
        public System.DateTime? DateApproved { get; set; } // DateApproved
        public decimal InvoiceAmount { get; set; } // InvoiceAmount
        public decimal? InvoiceVat { get; set; } // InvoiceVat
        public decimal? AuthorisedAmount { get; set; } // AuthorisedAmount
        public decimal? AuthorisedVat { get; set; } // AuthorisedVat
        public System.DateTime? InvoiceDate { get; set; } // InvoiceDate
        public int ClaimInvoiceStatusId { get; set; } // ClaimInvoiceStatusId
        public int IsAuthorised { get; set; } // IsAuthorised
        public string ExternalReferenceNumber { get; set; } // ExternalReferenceNumber (length: 255)
        public string InternalReferenceNumber { get; set; } // InternalReferenceNumber (length: 255)
        public decimal? UnclaimedPaymentInterest { get; set; } // UnclaimedPaymentInterest
        public decimal? TracingFees { get; set; } // TracingFees
        public decimal? CapAmount { get; set; } // CapAmount
        public decimal? CoverAmount { get; set; } // CoverAmount
        public List<InvoiceAllocation> InvoiceAllocations { get; set; } // CoverAmount
        public List<Benefit> Benefits { get; set; } // CoverAmount

        public ClaimInvoiceDecisionEnum? Decision { get; set; } // --

        public int? DecisionId
        {
            get => (int?)Decision;
            set => Decision = (ClaimInvoiceDecisionEnum?)value;
        }
        public decimal? ClaimAmount { get; set; } // ClaimAmount --
        public decimal? Refund { get; set; } // Refund --
        public int? ClaimStatusId { get; set; }
        public decimal? OutstandingPremium { get; set; } // OutstandingPremium --
        public int? DecisionReasonId { get; set; } // DecisionReasonId --
        public string ClaimReferenceNumber { get; set; } // ClaimReferenceNumber (length: 250)
        public int PolicyId { get; set; } // PolicyId
        public string PolicyNumber { get; set; } // PolicyNumber (length: 250)
        public System.DateTime CapturedDate { get; set; } // CapturedDate --
        public int? ProductId { get; set; } // ProductId
        public string Product { get; set; } // Product (length: 250)
        public Beneficiary BeneficiaryDetail { get; set; }
        public string MessageText { get; set; }
        public int? BankAccountId { get; set; } // BankAccountId
        public string ClaimantEmail { get; set; }
        public string ClaimNote { get; set; }
        public string MobileNumber { get; set; }
        public bool? IsBankingApproved { get; set; } // IsBankingApproved	
        public int? ReversalReasonId { get; set; } // ReversalReasonId --
        public ClaimBankAccountVerification ClaimBankAccountVerification { get; set; }
        public int? ReferToManagerId { get; set; }
        public string Payee { get; set; }
        public int PayeeTypeId { get; set; }
        public System.DateTime DaysOffFrom { get; set; }
        public System.DateTime DaysOffTo { get; set; }
        public int TotalDaysOff { get; set; }
        public ClaimInvoiceRepayReasonEnum? ClaimInvoiceRepayReason { get; set; } // ClaimInvoiceRepayReasonId
        public int? PayeeRolePlayerId { get; set; } // PayeeRolePlayerId
        public int? PayeeRolePlayerBankAccountId { get; set; } // PayeeRolePlayerBankAccountId
        public int? ClaimEstimateId { get; set; }
    }
}
