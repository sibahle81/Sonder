using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class CollectionAgent
    {
        public User Agent { get; set; }
        public List<int> AccountIds { get; set; }
        public int ClientTypeId { get; set; }
        public int AgeTypeId { get; set; }
        public int BalanceTypeId { get; set; }
        public DateTime EndDate { get; set; }
    }
}
