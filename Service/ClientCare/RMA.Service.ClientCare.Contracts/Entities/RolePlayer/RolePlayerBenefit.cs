using RMA.Service.ClientCare.Contracts.Entities.Product;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerBenefit : Benefit
    {
        public string RolePlayerName { get; set; }
        public string BenefitName { get; set; }
        public string ProductOptionName { get; set; }
        public int Age { get; set; }
        public bool AgeIsYears { get; set; }
        public bool IsStatedBenefit { get; set; }
        public bool Selected { get; set; }
    }
}
