using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Informant : AuditDetails
    {
        public int RolePlayerId { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public System.DateTime DateOfBirth { get; set; }
        public int BeneficiaryTypeId { get; set; }
        public string ContactNumber { get; set; }
    }
}