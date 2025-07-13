using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PolicyPayment
    {
        public List<Payment> Payments { get; set; }
        public int PolicyCount { get; set; }
    }
}
