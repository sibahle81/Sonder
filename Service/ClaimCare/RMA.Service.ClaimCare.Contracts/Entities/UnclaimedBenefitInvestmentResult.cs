namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class UnclaimedBenefitInvestmentResult
    {
        public double InvestmentReturn { get; set; }

        public int Period { get; set; }

        public double InterestEarned { get; set; }
    }
}
