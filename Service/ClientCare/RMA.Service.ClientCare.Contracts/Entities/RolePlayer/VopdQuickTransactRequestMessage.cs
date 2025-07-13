using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class VopdQuickTransactRequestMessage : ServiceBusMessageBase
    {
        public List<string> IdNumbers { get; set; }
    }
}
