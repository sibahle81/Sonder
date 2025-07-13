using System.Collections.Generic;
namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class EstimatePaymentResponse
    {
        public List<string> Months { get; set; }
        public List<EstimatePayment> Data { get; set; }
    }
}