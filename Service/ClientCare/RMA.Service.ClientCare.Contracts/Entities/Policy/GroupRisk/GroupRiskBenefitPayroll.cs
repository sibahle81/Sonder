using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class GroupRiskBenefitPayroll
    {
        public int RolePlayerId { get; set; }
        public List<BenefitPayroll> BenefitPayrolls { get; set; }
        public GroupRiskBenefitPayroll()
        {
            this.BenefitPayrolls = new List<BenefitPayroll>();
        }
    }
}
