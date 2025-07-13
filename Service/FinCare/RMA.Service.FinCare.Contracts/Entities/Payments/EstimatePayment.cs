using System.Collections.Generic;
namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class EstimatePayment
    {
        public string SenderAccountNo { get; set; }
        public string ClientType { get; set; }
        public string IndustryName { get; set; }
        public List<decimal> Amount { get; set; }
    }
}