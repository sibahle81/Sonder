namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class PolicyRenewal
    {
        public int PolicyExtensionId { get; set; } // PolicyExtensionId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public int PolicyExtensionDate { get; set; } // PolicyExtensionDate
        public decimal Premium { get; set; } // Premium
        public decimal CoverAmount { get; set; } // CoverAmount

    }
}
