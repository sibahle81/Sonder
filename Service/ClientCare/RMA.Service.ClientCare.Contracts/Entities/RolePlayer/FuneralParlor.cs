namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class FuneralParlor
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string RegistrationNumber { get; set; } // RegistrationNumber (length: 50)
        public string FuneralParlorName { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string AddressLine3 { get; set; }
        public string ContactNumber { get; set; }
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

    }
}