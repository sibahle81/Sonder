namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class DocumentDetails
    {
        public string PolicyNumber { get; set; }
        public string PersonFirstName { get; set; }
        public string PersonLastName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string DeceasedFirstName { get; set; }
        public string DeceasedLastName { get; set; }
        public string ClaimUniqueReference { get; set; } // Name (length: 100)
        public string DateCreated { get; set; } // Name (length: 100)
    }
}
