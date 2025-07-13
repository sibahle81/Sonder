namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BrokerageCommissionWithholdingSummary
    {
        public CommissionWithholding CommissionWithholding { get; set; }
        public CommissionDetail CommissionDetail { get; set; }
        public CommissionSummary CommissionSummary { get; set; }
    }
}
