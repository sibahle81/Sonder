using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ManageClaim
    {

        public int ClaimId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CauseOfDeath { get; set; }
        public string ClaimRefNumber { get; set; }
        public string TypeOfDeath { get; set; }
        public DateTime DateOfDeath { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string PolicyNumber { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public string IdentityNumber { get; set; }
    }
}