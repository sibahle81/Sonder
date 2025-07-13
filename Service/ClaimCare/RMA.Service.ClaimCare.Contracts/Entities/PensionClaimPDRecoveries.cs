using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionClaimPDRecoveries
    {
        public int? PersonEventId { get; set; }
        public int? ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string ProductCode { get; set; }
        public DateTime DateOfAccident { get; set; }
        public DateTime DateOfStabilisation { get; set; }
        public int ClaimInvoiceId { get; set; }
        public decimal PdLumpSumAmount { get; set; }
        public decimal PdPercentage { get; set; }
        public int? RolePlayerId { get; set; }
        public string IndustryNumber { get; set; }
        public string Member { get; set; }
    }
}
