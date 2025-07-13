using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class ForensicPathologist
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string RegistrationNumber { get; set; } // RegistrationNumber (length: 50)
        public string FirstName { get; set; } // RegistrationNumber (length: 50)
        public string LastName { get; set; } // RegistrationNumber (length: 50)
        public string ContactNumber { get; set; } // RegistrationNumber (length: 50)
        public bool IsValid { get; set; } // RegistrationNumber (length: 50)
        public DateTime? DateOfPostMortem { get; set; } // RegistrationNumber (length: 50)
        public string MortuaryName { get; set; } // RegistrationNumber (length: 50)
        public string PostMortemNumber { get; set; } // RegistrationNumber (length: 50)
        public string BodyNumber { get; set; } // RegistrationNumber (length: 50)
        public string SapCaseNumber { get; set; } // RegistrationNumber (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}