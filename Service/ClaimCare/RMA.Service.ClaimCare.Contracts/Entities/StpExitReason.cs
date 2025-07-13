namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class StpExitReason
    {
        public int StpExitReasonId { get; set; } // STPExitReasonID (Primary key)
        public string Name { get; set; } // Name (length: 100)
        public string Description { get; set; } // Description (length: 350)
    }
}
