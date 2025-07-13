namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class InflationPercentage
    {
        public int InflationPercentageId { get; set; }
        public int IndustryClassDeclarationConfigurationId { get; set; }
        public decimal Percentage { get; set; }
        public System.DateTime EffectiveFrom { get; set; }
        public System.DateTime? EffectiveTo { get; set; }
    }
}