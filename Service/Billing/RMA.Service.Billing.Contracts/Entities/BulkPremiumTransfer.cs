using System;
using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkPremiumTransfer
    {
        public string ClientCode { get; set; }
        public string BatchNo { get; set; }
        public DateTime BatchDate { get; set; }
        public List<BulkPremiumTransferDetail> PremiumTransferList { get; set; }
    }
}
