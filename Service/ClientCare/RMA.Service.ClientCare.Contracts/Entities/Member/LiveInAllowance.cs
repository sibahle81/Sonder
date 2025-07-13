namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class LiveInAllowance
    {
        public int LiveInAllowanceId { get; set; } // LiveInAllowanceId (Primary key)
        public int IndustryClassDeclarationConfigurationId { get; set; } // IndustryClassDeclarationConfigurationId
        public decimal Allowance { get; set; } // Allowance
        public System.DateTime EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
    }
}