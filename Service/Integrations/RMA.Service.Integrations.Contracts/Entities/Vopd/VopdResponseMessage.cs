using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.Vopd
{
    public class VopdResponseMessage : ServiceBusMessageBase
    {
        public string TransRefGuid { get; set; }
        public int VopdRequestStatus { get; set; }
        public int VopdRequestSource { get; set; }
        public List<VerificationDetail> VerificationDetails { get; set; }
    }
}