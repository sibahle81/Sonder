namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.RequestedAmountCannotExceedAllocated
{
    public class RuleData
    {
        public decimal TotalAssessedAmountWithTolerance { get; set; }
        public decimal TotalRequestedAmount { get; set; }
    }
}
