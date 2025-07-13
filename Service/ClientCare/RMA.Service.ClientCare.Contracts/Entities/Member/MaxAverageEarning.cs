namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class MaxAverageEarning
    {
        public int MaxAverageEarningsId { get; set; } // MaxAverageEarningsId (Primary key)
        public int IndustryClassDeclarationConfigurationId { get; set; } // IndustryClassDeclarationConfigurationId
        public decimal MinAverageEarnings { get; set; } // MinAverageEarnings
        public decimal MaxAverageEarnings { get; set; } // MaxAverageEarnings
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
    }
}