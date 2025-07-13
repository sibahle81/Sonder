namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.Modifier
{
    public class Constants
    {
        public const string ModifierFirstLineRuleName = "Modifier First Line Validation";
        public const string ModifierFirstLineValidation = "Invoice first line cannot be a modifier";
        public const string ModifierCodeInvalidRuleName = "Modifier Code Validation";
        public const string ModifierCodeInvalidValidation = "Modifier code is invalid";
        public const string NoData = "No data was supplied";
        public const string ModifierDentalRuleName = "Modifier Dental Line Validation";
        public const string ModifierDentalValidation = "The modifier is only applicable on dental practices.";
        public const string ModifierMaxilloRuleName = "Modifier Maxillo Line Validation";
        public const string ModifierMaxilloValidation = "The modifier is only applicable on dental practices.";
    }
}
