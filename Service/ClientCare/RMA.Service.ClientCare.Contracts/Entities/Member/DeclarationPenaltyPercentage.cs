namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class DeclarationPenaltyPercentage
    {
        public int DeclarationPenaltyPercentageId { get; set; }
        public int IndustryClassDeclarationConfigurationId { get; set; }
        public decimal PenaltyPercentage { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public System.DateTime? EffectiveTo { get; set; }
    }
}