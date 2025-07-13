namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class BeneficiaryDetails
    {
        public string Title { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string ContactNumber { get; set; }
        public string IdNumber { get; set; }
        public float BenefitAllocationPercentage { get; set; }
    }
}
