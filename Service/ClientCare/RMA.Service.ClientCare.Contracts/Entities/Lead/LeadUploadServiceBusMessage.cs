using RMA.Common.Entities;

using LeadModel = RMA.Service.ClientCare.Contracts.Entities.Lead.Lead;

namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadUploadServiceBusMessage : ServiceBusMessageBase
    {
        public LeadModel LeadModel { get; set; }
    }
}