namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyProductOptionModel
    {

        public string PolicyNumber { get; set; }

        public string ProductOptionName { get; set; }

        public string ProductOptionCode { get; set; }

        public decimal PolicyCoverAmount { get; set; }

        public decimal MaximumCoverAmount { get; set; }

    }
}
