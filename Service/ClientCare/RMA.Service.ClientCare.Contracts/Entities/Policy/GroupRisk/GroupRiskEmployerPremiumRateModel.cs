using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class GroupRiskEmployerPremiumRateModel
    {
        public int EmployerRolePlayerId { get; set; }
        public List<PolicyPremiumRateDetailModel> PolicyPremiumRateDetailModels { get; set; }
        public GroupRiskEmployerPremiumRateModel()
        {
            this.PolicyPremiumRateDetailModels = new List<PolicyPremiumRateDetailModel>();
        }
    }
}
