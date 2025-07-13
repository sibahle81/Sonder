namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class QuotationType : Common.Entities.AuditDetails
    {
        public int QuotationTypeId { get; set; } // QuotationTypeId (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public string Description { get; set; } // Description (length: 50)
    }
}
