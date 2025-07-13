using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyEmail
    {
        public string PolicyNumber { get; set; }
        public bool SendGroupPolicySchedule { get; set; }
        public List<string> Recipients { get; set; }
    }
}
