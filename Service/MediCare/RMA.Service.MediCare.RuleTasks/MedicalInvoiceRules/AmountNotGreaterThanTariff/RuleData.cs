namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.AmountNotGreaterThanTariff
{
    public class RuleData
    {
        public decimal AuthorisedAmount { get; set; } // authorisedAmount for each invoice line
        public decimal TariffAmount { get; set; } // tariffAmount for each invoice line 
        public decimal ItemTolerance { get; set; } //ItemTolerance -extra amount allowed after amount exceeded  
        public int AuthorisedQuantity { get; set; }
        public int TariffQuanity { get; set; }
    }
}
