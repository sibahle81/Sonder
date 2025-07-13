namespace RMA.Service.Billing.Contracts.Entities
{
    public class PaymentStagingRecord
    {
        public int Id { get; set; } // Id (Primary key)
        public System.Guid FileIdentifier { get; set; } // FileIdentifier
        public string PayNumber { get; set; } // PayNumber (length: 20)
        public string AreaCode { get; set; } // AreaCode (length: 20)
        public string PolicyNumber { get; set; } // PolicyNumber (length: 30)
        public string PolicyId { get; set; } // PolicyId (length: 20)
        public string CommencementDate { get; set; } // CommencementDate (length: 20)
        public string Initials { get; set; } // Initials (length: 5)
        public string Surname { get; set; } // Surname (length: 20)
        public string IdNumber { get; set; } // IdNumber (length: 13)
        public decimal PaymentReceived { get; set; } // PaymentReceived
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
