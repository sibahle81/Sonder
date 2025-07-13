namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyChangeBenefit
    {
        public int PolicyChangeBenefitId { get; set; }
        public int PolicyChangeProductId { get; set; }
        public int OldBenefitId { get; set; }
        public int NewBenefitId { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
