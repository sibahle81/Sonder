using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class VopdUpdateResponse : ServiceBusMessageBase
    {
        public List<VopdUpdateResponseModel> VopdUpdateResponses { get; set; }
    }
}
