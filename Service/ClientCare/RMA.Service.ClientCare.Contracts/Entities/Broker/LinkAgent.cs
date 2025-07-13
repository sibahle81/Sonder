using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class LinkAgent
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public PaymentMethodEnum? PaymentMethod { get; set; }
        public PaymentFrequencyEnum? PaymentFrequency { get; set; }
        public List<BrokerageRepresentative> BrokerageRepresentatives { get; set; }
        public List<ValidityCheck> RepresentativeChecks { get; set; }
        public List<Note> RepresentativeNotes { get; set; }
    }
}
