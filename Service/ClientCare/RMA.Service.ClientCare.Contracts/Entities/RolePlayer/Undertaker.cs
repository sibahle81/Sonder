using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Undertaker
    {
        public int RolePlayerId { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string RegistrationNumber { get; set; }
        public string ContactNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? DateOfBurial { get; set; }
        public string PlaceOfBurial { get; set; }
        public bool IsValid { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}