namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class BodyCollector
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string RegistrationNumber { get; set; } // RegistrationNumber (length: 50)
        public string ContactNumber { get; set; }
        public string IdNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PassportNumber { get; set; }
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; }
        public System.DateTime? DateOfBirth { get; set; }
        public System.DateTime? CollectionOfBodyDate { get; set; }
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}