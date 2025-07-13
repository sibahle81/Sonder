namespace RMA.Service.Billing.Contracts.Entities
{
    public class BrokerPaymentScheduleModel
    {
        public int PolicyId { get; set; }
        public int SchemeRolePlayerId { get; set; }
        public string SchemePolicyNumber { get; set; }
        public decimal InstallmentPremium { get; set; }
        public string SchemeName { get; set; }
        public string SchemeEmailAddress { get; set; }
        public int BrokerageId { get; set; }
        public string BrokerContactName { get; set; }
        public string BrokerContactLastName { get; set; }
        public string BrokerContactEmail { get; set; }
        public string DebtorNumber { get; set; }
        public string PaymentMonth { get; set; }
    }
}
