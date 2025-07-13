using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionPaymentRequest
    {
        public List<CommissionHeader> CommissonHeaders { get; set; }
    }
}
