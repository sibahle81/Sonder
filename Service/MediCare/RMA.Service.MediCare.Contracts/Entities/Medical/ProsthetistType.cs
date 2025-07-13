namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ProsthetistType : Common.Entities.AuditDetails
    {
        public int ProsthetistTypeId { get; set; } // ProsthetistTypeId (Primary key)
        public string ProsthetistTypeName { get; set; } // ProsthetistTypeName (length: 50)
        public string Description { get; set; } // Description (length: 2048)
        public bool RequireSpecification { get; set; } // RequireSpecification
    }
}
