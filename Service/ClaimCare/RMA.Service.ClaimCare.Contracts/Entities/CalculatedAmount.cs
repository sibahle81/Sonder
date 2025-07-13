namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CalculatedAmount
    {
        public double Amount { get; set; }

        public double InterestFactor { get; set; }

        public int InvestmentPeriod { get; set; }

        public double IncrementalRate { get; set; }
    }
}
