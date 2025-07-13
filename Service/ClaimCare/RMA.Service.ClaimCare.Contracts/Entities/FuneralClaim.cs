using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class FuneralClaim : AuditDetails
    {
        public int CaseId { get; set; } // CaseId
        public string ClaimNumber { get; set; } // ClaimNumber (length: 50)
        public int ClaimTypeId { get; set; } // ClaimTypeId
        public int ClaimStatusId { get; set; } // ClaimStatusId
        public int PolicyId { get; set; } // PolicyId
        public decimal? TotalBenefitAmount { get; set; } // TotalBenefitAmount
        public int? AssignedToUserId { get; set; } // AssignedToUserId
        public int? WorkPoolId { get; set; } // WorkPoolId
        public string ClaimUniqueReference { get; set; } // ClaimUniqueReference (length: 50)
        public int? PaymentId { get; set; } // PaymentId
    }
}