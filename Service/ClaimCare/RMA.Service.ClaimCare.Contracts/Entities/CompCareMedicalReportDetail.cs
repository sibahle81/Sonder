using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class CompCareMedicalReportDetail
    {
        public int CompCarePersonEventId { get; set; }
        public string ICD10Codes { get; set; }
        public int ICD10DiagnosticGroupId { get; set; }
        public DateTime ReportDate { get; set; }
        public int MedicalReportTypeId { get; set; }
    }
}
