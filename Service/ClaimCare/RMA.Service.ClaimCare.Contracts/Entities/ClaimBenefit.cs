namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimBenefit
    {
        public int ClaimBenefitId { get; set; }
        public int ClaimId { get; set; }
        public int BenefitId { get; set; }
        public decimal EstimatedValue { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
