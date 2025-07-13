using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionCaseNotificationResponse : ServiceBusMessageBase
    {
        public string PensionCaseNumber { get; set; }
        public int WizardId { get; set; }
        public bool IsOperationSuccessFull { get; set; }
        public string ResponseMessage { get; set; }
    }
}