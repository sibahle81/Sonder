namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.PersonNameMatch
{
    public class RuleData
    {
        public string PersonNameOnClaim { get; set; }
        public string PersonNameOnInvoice { get; set; }

        public string InitialOnClaim { get; set; }
        public string InitialOnInvoice { get; set; }
        public string SurnameOnClaim { get; set; }
        public string SurnameOnInvoice { get; set; }
    }
}
