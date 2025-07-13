namespace RMA.Service.MediCare.Constants
{
    public static class MediCareConstants
    {
        //Modernization values
        public const string DepartmentNameClassIVMining = "COID Class IV - Medical Invoices";
        public const string DepartmentNameClassXIIIMetals = "COID Class XIII - Medical Invoices";
        public const string DepartmentNameClassOthers = "COID Class OTHER - Medical Invoices";
        //Compcare ClaimType for STPIntegration
        public const string CompcareClaimTypeIODCOID = "RMA COIDA IOD";
        public const string CompcareClaimTypeRMACOIDAIOD = "WCC COIDA";
        public const string CompcareClaimTypeWCCCOIDA = "RMA Riot";
        // for PreAuth line Authorised check
        public const string LineItemAuthorised = "Authorised";
        public const string LineItemNotAuthorised = "NotAuthorised";
        //DRG Codes
        public const string SequelaeDRGCode = "DRG27";
        public const string ExternalCausesDRGCode = "DRG28";

        //CompCare Integration
        public const string MessageFrom = "mcc";
        public const string MessageTo = "cmp";
        public const string MessageTaskType012 = "012";

        //Regex
        public const string RegexCheckICD10CodeFormat = "[a-zA-Z][0-9]{2}([.][0-9]{1,2})?";
        public const string RegexCheckValidEmailAddress = @"^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$";
        public const string RegexCheckValidPhoneNumber = @"[0](\d{9})|([0](\d{2})( |-)((\d{3}))( |-)(\d{4}))|[0](\d{2})( |-)(\d{7})";
        public const string RegexCheckMaskedPreAuthNumber = "[0-9]";

        public const string TreatmentAuthProhibitedPractitionerTypeId = "TreatmentAuthProhibitedPractitionerTypeId";

        //PayeeType
        public const int TebaPayeeType = 11;

        //Publication
        public const int P01 = 2;
        public const int P04 = 5;
        public const int P12 = 13;

        //TariffBaseUnitCostType
        public const int ANAESTHETIC = 2;
        public const int CLINICAL_PROCEDURES = 3;

        //TariffType
        public const int TariffType_COID = 2;
        public const int TariffType_NRPL = 4;

        //Modifier Constants
        public const int MODIFIER_MEDICAL_ITEM_TYPE = 3;
        public const decimal MODIFIER_DEFAULT_QUANTITY = 1.0M;

        public const int MODIFIER_0009_DEFAULT_CLINICAL_UNITS = 36;

        public const int MODIFIER_0023_15_MINS_UPTO_1_HRS = 2;
        public const int MODIFIER_0023_AFTER_1_HRS_EACH_15_MINS = 3;
        public const int MODIFIER_0023_ANAESTHETIC_TIME_MINUTE = 15;
        public const int MODIFIER_0023_ANAESTHESIA_PER_HOUR = 4;

        public const int MODIFIER_0036_15_MINS_UPTO_1_HRS = 2;
        public const int MODIFIER_0036_AFTER_1_HRS_EACH_15_MINS = 3;
        public const int MODIFIER_0036_ANEASTHETIC_MIN_UNITS = 7;
        public const int MODIFIER_0036_ANEASTHETIC_MAX_UNITS = 11;
        public const int MODIFIER_0036_FIRST_HOUR_ANEASTHETIC_UNITS = 8;

        public const int MODIFIER_0011_30_MINS = 12;

        public const int MODIFIER_0039_UPTO_60_MINS = 3;
        public const int MODIFIER_0039_THEREAFTER_EACH_15_MINS = 1;
        public const int MODIFIER_0039_1HR_MINUTES = 60;
        public const int MODIFIER_0039_AFTERHR_MINUTES = 15;

        public const int MODIFIER_0001_DEFAULT_RADIOLOGICAL_UNITS = 100;
        public const string MODIFIER_0001_SectionNo = "22100";

        public const int MODIFIER_0035_ANEASTHETIC_UNITS = 7;

        public const decimal MODIFIER_0008_PERCENT = 0.4M;
        public const decimal MODIFIER_0036_PERCENT = 0.8M;
        public const string MODIFIER_0005_CODE = "0005";
        public const int MODIFIER_0005_FIRST_COUNT = 1;
        public const int MODIFIER_0005_SECOND_COUNT = 2;
        public const int MODIFIER_0005_THIRD_COUNT = 3;
        public const int MODIFIER_0005_FOURTH_AND_MORE_COUNT = 4;
        public const decimal MODIFIER_0005_FIRST_PERCENT = 1.0M;
        public const decimal MODIFIER_0005_SECOND_PERCENT = 0.75M;
        public const decimal MODIFIER_0005_THIRD_PERCENT = 0.5M;
        public const decimal MODIFIER_0005_FOURTH_AND_MORE_PERCENT = 0.25M;
        public const string MODIFIER_0018_CODE = "0018";
        public const string MODIFIER_0009_CODE = "0009";
        public const int ANEASTHETICS = 4;
        public const string MODIFIER_0023_CODE = "0023";
        public const string MODIFIER_0036_CODE = "0036";
        public const int FIRST_HOUR_MINUTES = 60;
        public const int ONE_HOUR_FIFTEEN_MINUTES = 75;
        public const int FIFTEEN_MINUTES_SPAN_IN_ONE_HOUR = 4;
        public const string MODIFIER_0006_CODE = "0006";
        public const decimal MODIFIER_0006_FIFTY_PERCENT = 0.5M;
        public const decimal MODIFIER_0006_TWENTY_FIVE_PERCENT = 0.25M;
        public const int GP = 7;
        public const string MODIFIER_0011_CODE = "0011";
        public const int HALF_HOUR = 30;
        public const string MODIFIER_0035_CODE = "0035";
        public const int MODIFIER_0035_15_MINS_UPTO_1_HRS = 2;
        public const int MODIFIER_0035_AFTER_1_HRS_EACH_15_MINS = 3;
        public const int MODIFIER_0035_ANEASTHETIC_MIN_UNITS = 7;
        public const decimal MODIFIER_0035_PERCENT = 0.8M;
        public const int FIFTEEN_MINUTES = 15;
        public const int GP_CONSULT = 8;
        public const string MODIFIER_8001_CODE = "8001";
        public const int Publication02 = 3;
        public const int DENTAL = 7;
        public const int MAXILLO_FACIAL_PRACTICE = 33;
        public const decimal MODIFIER_ONE_THIRD_PERCENT = 0.3333M;
        public const decimal MODIFIER_FIFTEEN_PERCENT = 0.15M;
        public const int DENTAL_PRACTICE = 28;
        public const string MODIFIER_8007_CODE = "8007";
        public const decimal MODIFIER_FIFTY_PERCENT = 0.5M;
        public const string MODIFIER_8002_CODE = "8002";
        public const string MODIFIER_8006_CODE = "8006";
        public const decimal MODIFIER_TWENTY_FIVE_PERCENT = 0.25M;
        public const string MODIFIER_8009_CODE = "8009";
        public const string MODIFIER_8005_CODE = "8005";
        public const string MODIFIER_8010_CODE = "8010";
        public const decimal MODIFIER_SEVENTY_FIVE_PERCENT = 0.75M;
        public const string MODIFIER_8008_CODE = "8008";
    }
}

