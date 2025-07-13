using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class ReSendPeriodicStatementRequest
    {
        public int EmailAuditId { get; set; }
        public List<string> Reciepients { get; set; }
    }
}
