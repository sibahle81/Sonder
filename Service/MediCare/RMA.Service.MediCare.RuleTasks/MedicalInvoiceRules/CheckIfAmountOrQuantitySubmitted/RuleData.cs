namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.CheckIfAmountOrQuantitySubmitted
{
    public class RuleData
    {
        public int QuanInvoiceLineQuantitytity { get; set; }
        public decimal? TotalInvoiceLineCostInclusive { get; set; }
    }
}
