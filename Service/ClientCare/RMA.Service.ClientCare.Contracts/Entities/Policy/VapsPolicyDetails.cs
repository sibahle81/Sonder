using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class VapsPolicyDetails
    {
        public string ErrorMessage { get; set; }
        public string PolicyNumber { get; set; }
        public System.DateTime? PolicyInceptionDate { get; set; }
        public System.DateTime? EuropAssistEffectiveDate { get; set; }
        public System.DateTime? EuropAssistEndDate { get; set; }
        public List<InsuredLifeResponse> InsuredLives { get; set; }
    }
}