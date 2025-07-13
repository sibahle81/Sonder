namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfRequestedAmountEqualsToLineTotalSubmitted
{
    public class RuleData
    {
        public decimal? TotalInvoiceAmountInclusive { get; set; }
        public decimal? TotalInvoiceLinesCostInclusive { get; set; }
    }
}
