using RMA.Common.Entities;
using RMA.Service.Integrations.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.Vopd
{
    public class VopdRequestMessage : ServiceBusMessageBase
    {
        public string IdReferenceNo { get; set; }
        public string IdNumber { get; set; }
        public int UserId { get; set; }
        public VopdVerificationType VerificationType { get; set; }
        public int RolePlayerId { get; set; }
    }
}