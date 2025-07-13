namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class MinimumAllowablePremium
    {
        public int MinimumAllowablePremiumId { get; set; }
        public int IndustryClassDeclarationConfigurationId { get; set; }
        public decimal MinimumPremium { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public System.DateTime? EffectiveTo { get; set; }
    }
}