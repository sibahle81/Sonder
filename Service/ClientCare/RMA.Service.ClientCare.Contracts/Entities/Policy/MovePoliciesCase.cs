using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class MovePoliciesCase : Case
    {
        public PolicyMovement PolicyMovement { get; set; }
        public bool IsReclaimingPolicies { get; set; }
    }
}
