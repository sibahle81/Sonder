using RMA.Common.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimCommunicationMessage : ServiceBusMessageBase
    {
        public ClaimCommunicationTypeEnum ClaimCommunicationType { get; set; }
        public ClaimEmail ClaimEmployerEmail { get; set; }
        public ClaimSMS ClaimEmployerSMS { get; set; }
        public ClaimEmail EmployeeClaimEmail { get; set; }
        public ClaimSMS EmployeeClaimSMS { get; set; }
        public RolePlayer Employee { get; set; }
        public RolePlayer Employer { get; set; }
        public string ClaimNumber { get; set; }
        public RolePlayerContact EmployerContact { get; set; }
        public RolePlayerContact EmployeeContact { get; set; }
        public bool IsNotificationOnly { get; set; }
        public PersonEvent PersonEvent { get; set; }
        public int DayCount { get; set; }
        public string RequiredDocuments { get; set; }
    }
}