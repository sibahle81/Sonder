using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class EmailCommissionStatementRequest
    {
        public List<string> EmailAddresses { get; set; }
        public int AccountId { get; set; }
        public int AccountTypeId { get; set; }
        public int PeriodId { get; set; }
    }
}
