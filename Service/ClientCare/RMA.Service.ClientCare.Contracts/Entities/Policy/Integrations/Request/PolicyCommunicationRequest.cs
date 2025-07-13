using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class PolicyCommunicationRequest
    {

        public string RecipientType { get; set; }
        public int PolicyId { get; set; }
        public int ParentPolicyId { get; set; }
        public string PolicyCommunicationType { get; set; }

        public string PolicyNumber { get; set; }
    }
}
