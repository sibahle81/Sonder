using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class LetterOfGoodStandingServiceBusMessage : ServiceBusMessageBase
    {
        public int RolePlayerId { get; set; }
        public int PolicyId { get; set; }
        public System.DateTime IssueDate { get; set; }
        public System.DateTime ExpiryDate { get; set; }
    }
}