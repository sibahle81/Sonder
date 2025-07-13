using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDocumentContacts
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public int RolePlayerId { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public CommunicationTypeEnum CommunicationType { get; set; }
        public string MobileNumber { get; set; }
        public string EmailAddress { get; set; }
        public bool OverrideCommunications { get; set; }
        public string OverrideMobile { get; set; }
        public string OverrideEmail { get; set; }
        public bool SendPolicyDocsToMember { get; set; }
        public bool SendPolicyDocsToBroker { get; set; }
        public bool SendPolicyDocsToScheme { get; set; }
        public bool SendPolicyDocsToAdmin { get; set; }
        public bool SendPaymentScheduleToBroker { get; set; }
        public string BrokerContacts { get; set; }
        public string SchemeContacts { get; set; }
        public string AdminContact { get; set; }
    }
}
