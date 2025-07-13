namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimsTracing
    {
        public int ClaimsTracingId { get; set; }
        public int ClaimId { get; set; }
        public int RolePlayerId { get; set; }
        public int? RolePlayerBankingId { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }

    }
}