using RMA.Common.Entities;

namespace RMA.Service.Integrations.Contracts.Entities.Vopd
{
    public class VerificationDetail : ServiceBusMessageBase
    {
        public string DateOfDeath { get; set; }
        public int VopdVerificationType { get; set; }
        public string IdNumber { get; set; }
        public string ErrorMessage { get; set; }
        public string SmartId { get; set; }
        public string Surname { get; set; }
        public string Forename { get; set; }
        public string DeceasedStatus { get; set; }
        public string RequestMessageId { get; set; }
    }
}