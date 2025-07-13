using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRecoveryView
    {
        public string EventDescription { get; set; }
        public RolePlayer Deceased { get; set; }
        public RolePlayer RecoveryRolePlayer { get; set; }
        public DateTime InsuredDeathDate { get; set; }
        public int ClaimNumber { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public DateTime ClaimCreatedDate { get; set; }
        public ClaimInvoice ClaimInvoice { get; set; }
        public int ClaimId { get; set; }
    }
}