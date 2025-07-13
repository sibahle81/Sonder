namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitRate
    {
        public int Id { get; set; } // Id (Primary key)
        public int BenefitId { get; set; } // BenefitId
        public decimal BaseRate { get; set; } // BaseRate
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public decimal BenefitAmount { get; set; } // BenefitAmount
        public string BenefitRateStatusText { get; set; }
    }
}