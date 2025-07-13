namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DocumentTemplate
    {
        public int Id { get; set; } // Id (Primary key)
        public string EmailHeader { get; set; } // EmailHeader
        public string EmailFooter { get; set; } // EmailFooter
        public string EmailBody { get; set; } // EmailBody
        public string DocumentName { get; set; } // DocumentName (length: 250)
        public string DocumentExtension { get; set; } // DocumentExtension (length: 50)
        public string DocumentMimeType { get; set; } // DocumentMimeType (length: 50)


    }
}