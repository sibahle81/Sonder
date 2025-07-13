namespace RMA.Service.ClaimCare.Database.Constants
{
    public static class ClaimConstants
    {
        public const string MiningClass = "4";
        public const string MetalsClass = "13";
        public const string OtherClass = "20";
        public const string IndividualGroupSennaClass = "1";

        public const string SendToSTPIntegration = "SendToSTPIntegration";
        public const string MessageFrom = "mcc";
        public const string MessageTo = "cmp";
        public const string MessageTaskType002 = "002";
        public const string MessageTaskType003 = "003";
        public const string MessageTaskType005 = "005";
        public const string MessageTaskType006 = "006";
        public const string MessageTaskType000 = "000";
        public const string MessageTaskType009 = "009";

        public const string CompCareOtherAdvisementMethod = "Other, e.g. via News etc";
        public const string CompCareClaimantReportedtMethod = "Claimant reported Paper";
        public const int UnknownICD10Code = 2;

        public const decimal STPMedicalMaxAmount = 5000;
        public const decimal STPPdEstimateAmount = 0;

        public const decimal MVAMaxAmount = 25000;

        public const decimal CaMaxPDPercentage = 10;
        public const decimal SCAMaxPDPercentage = 30;

        //chronic years from event date
        public const int AddYearsForChronicCheck = 2;

        public const string ClientApplicationId = "RmaSF.MIInsightsIntegrationApi";
        public const string DisableCOIDClaimCare = "Disable_COID_VAPS_E2E_ClaimCare";

    }
}
