namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class LeadContactV2
    {
        public int ContactId { get; set; } // ContactId (Primary key)
        public int LeadId { get; set; } // LeadId
        public string Name { get; set; } // Name (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public string EmailAddress { get; set; } // EmailAddress (length: 50)
        public string ContactNumber { get; set; } // ContactNumber (length: 50)
        public string TelephoneNumber { get; set; } // TelephoneNumber (length: 50)
        public int? PreferredCommunicationTypeId { get; set; } // PreferredCommunicationTypeId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}