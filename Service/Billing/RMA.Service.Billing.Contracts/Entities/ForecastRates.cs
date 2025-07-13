
namespace RMA.Service.Billing.Entities
{
    public class ForecastRates
    {
        public int ForecastRateId { get; set; } // ForecastRateId
        public int ProductId { get; set; } // ProductId
        public System.DateTime? EffectiveFrom { get; set; } // EffectiveFrom
        public System.DateTime? EffectiveTo { get; set; } // EffectiveTo
        public decimal? ForecastRate { get; set; } // ForecastRate
        public bool IsDeleted { get; set; } // IsDeleted
        public string Name { get; set; } // Name
        public System.DateTime CreatedDate { get; set; } // CreatedDate
    }
}
