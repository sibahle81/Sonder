
namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class TopRankedEstimateAmount
    {
        public decimal? MedicalCostEstimate { get; set; }
        public decimal? PDExtentEstimate { get; set; }
        public decimal? DaysOffEstimate { get; set; }
    }
}