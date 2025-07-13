namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyInsuredLifeAdditionalBenefit
    {
        public int PolicyId { get; set; }
        public int RolePlayerId { get; set; }
        public int BenefitId { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
