namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CommissionWithholdingSummary
    {
        public int PolicyId { get; set; }

        public string PolicyNumber { get; set; }

        public int BrokerId { get; set; }

        public string BrokerName { get; set; }

        public int ClientId { get; set; }

        public string ClientName { get; set; }

        public decimal WithholdingBalance { get; set; }
    }
}
