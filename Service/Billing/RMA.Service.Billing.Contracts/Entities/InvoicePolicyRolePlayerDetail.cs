using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoicePolicyRolePlayerDetail
    {
        public RolePlayerPolicy RolePlayerPolicy { get; set; }
        public Invoice Invoice { get; set; }
    }
}
