namespace RMA.Service.MediCare.RuleTasks.PreAuthRules
{
    public static class Constants
    {
        public const string PreAuthFromDateRuleName = "PreAuth FromDate validation with Event date";
        public const string PreAuthFromDateValidation = "PreAuth FromDate must be after the Event date";

        public const string PreAuthToDateRuleName = "PreAuth ToDate validation with Event date";
        public const string PreAuthToDateValidation = "PreAuth ToDate must be after the Event date";

        public const string PreAuthInjuryDateRuleName = "PreAuth Injury date validation with Event date";
        public const string PreAuthInjuryDateValidation = "PreAuth Injury Date must be same as Event date";

        public const string PreAuthDateOfDeathRuleName = "PreAuth Date of Death validation";
        public const string PreAuthFromDateDODValidation = "PreAuth FromDate must be on or before the Date Of death";
        public const string PreAuthToDateDODValidation = "PreAuth ToDate must be on or before the Date Of death";

        public const string ProstheticEarlyReplacementRuleName = "Orthotic and Prosthetic EarlyReplacement override";
        public const string ProstheticEarlyReplacementValidation = "Orthotic and Prosthetic override for early replacement";


        public const string NoData = "No data was supplied";
    }
}