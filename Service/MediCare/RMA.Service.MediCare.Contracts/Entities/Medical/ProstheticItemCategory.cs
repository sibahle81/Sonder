namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ProstheticItemCategory : Common.Entities.AuditDetails
    {
        public int ProstheticItemCategoryId { get; set; } // ProstheticItemCategoryID (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 2048)

    }
}
