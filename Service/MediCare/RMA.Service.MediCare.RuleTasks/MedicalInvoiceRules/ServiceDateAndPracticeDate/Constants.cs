namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.ServiceDateAndPracticeDate
{
    public static class Constants
    {
        public const string ServiceDateAndPracticeDateRuleName = "Service date and practice date validation";
        public const string ServiceDateAndPracticeDateValidation = "Service date cannot be before practice start date or after practice closed date";

        public const string NoData = "No data was supplied";
    }
}
