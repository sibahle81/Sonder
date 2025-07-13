using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Claimant : AuditDetails
    {
        public int ClaimId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string IdentityNumber { get; set; }
        public string PassportNumber { get; set; }
        public string Email { get; set; }
        public string Mobile { get; set; }
    }
}