using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoiceMessage : ServiceBusMessageBase
    {
        public int SwitchBatchInvoiceId { get; set; }

    }
}
