using System;
using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{
    public class CCFirstMedicalReportResponseIcd10Codes
    {
        public string ICD10Code { get; set; }
    }

    public class MedicalReportSubmissionResponse
    {
        public int personEventID { get; set; }
        public string healthCareProviderPracticeNumber { get; set; }
        public DateTime consultationDate { get; set; }
        public int medicalReportCategoryID { get; set; }
        public int medicalReportTypeID { get; set; }
        public int medicalReportID { get; set; }
        public List<CCFirstMedicalReportResponseIcd10Codes> icd10Codes { get; set; }
        public string sourceSystemReference { get; set; }
        public string sourceSystemRoutingID { get; set; }
        public string httpStatusCode { get; set; }
        public string httpStatusMessage { get; set; }
        public string message { get; set; }
        public string code { get; set; }
        public string requestGUID { get; set; }
    }

    public class RootMedicalReportSubmissionResponse
    {
        public MedicalReportSubmissionResponse response { get; set; }
    }
}
