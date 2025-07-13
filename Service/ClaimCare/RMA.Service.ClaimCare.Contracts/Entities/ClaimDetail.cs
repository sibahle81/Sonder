namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimDetail
    {
        public Case Case { get; set; }
        public Claim Claim { get; set; }
        public CaseClaim CaseClaim { get; set; }
        public Fatal Fatal { get; set; }
    }
}