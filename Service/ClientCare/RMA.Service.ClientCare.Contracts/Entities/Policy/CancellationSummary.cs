namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CancellationSummary
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Count { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }
    }
}