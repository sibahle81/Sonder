using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class AdhocInterestRequest
    {
        public int TransactionId { get; set; }
        public List<DateTime> InterestDates { get; set; }
    }
}
