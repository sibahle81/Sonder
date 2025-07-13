namespace RMA.Service.MediCare.RuleTasks.HealthcareProviderCheckRules
{
    public static class Constants
    {
        public const string HealthcareProviderPracticeCheckRuleName = "Healthcare Provider Check Rules validation";
        public const string PracticeNumberExistValidation = "Practice Number Does Not Exist";
        public const string HealthcareProviderActiveValidation = "Healthcare Provider Is Not Active";
        public const string HealthcareProviderMedialReportRequiredValidation = "No matching medical report found with treatment/report dates for Healthcare Provider";
        public const string MedialReportRequiredRuleName = "Medical Report Check validation";
        public const string NoData = "No data was supplied";
    }
}
