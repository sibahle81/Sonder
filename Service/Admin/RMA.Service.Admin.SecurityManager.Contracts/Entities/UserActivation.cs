using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserActivation : AuditDetails
    {
        public int UserActivationId { get; set; } // UserActivationId (Primary key)
        public string ActivationLink { get; set; } // ActivationLink
        public byte[] ActivationToken { get; set; } // ActivationToken
        public string ActivationHash { get; set; } // ActivationHash
        public string Data { get; set; } // Data
        public System.DateTime? ActivationExpiryDate { get; set; } // ActivationExpiryDate
        public bool MemberActivated { get; set; } // MemberActivated
    }
}