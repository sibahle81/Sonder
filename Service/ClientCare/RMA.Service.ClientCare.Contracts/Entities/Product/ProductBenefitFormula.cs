namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductBenefitFormula
    {
        public int ProductBenefitFormulaId { get; set; } 
        public int BenefitId { get; set; } 
        public string Formula { get; set; } 
        public System.DateTime EffectiveStartDate { get; set; } 
        public System.DateTime? EffectiveEndDate { get; set; }
        public decimal? EarningsMultiplier { get; set; }
        public decimal? EarningsPercentage { get; set; } 
    }
}
