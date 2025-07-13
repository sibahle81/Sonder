using RMA.Service.ClientCare.Contracts.Entities.Product;

namespace RMA.Service.ClientCare.Contracts.Entities.Quote
{
    public class DependentQuote
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public ProductOption ProductOption { get; set; }
        public Quote Quote { get; set; }
    }
}
