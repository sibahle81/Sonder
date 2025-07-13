using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoiceReinstateParams
    {
        public List<int> SwitchBatchInvoiceIds { get; set; }
        public string ReinstateReason { get; set; }
    }
}
