namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class DocumentManagementHeader
    {
        public string Name { get; set; } // Name (length: 100)
        public string Surname { get; set; } // Name (length: 100)
        public string PolicyNumber { get; set; } // Name (length: 100)
        public string ClaimUniqueReference { get; set; } // Name (length: 100)

    }
}
