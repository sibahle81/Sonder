using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceReportMapDetail
    {
        public int InvoiceReportMapId { get; set; }
        public int InvoiceId { get; set; }
        public int MedicalReportId { get; set; }
        public int ToleranceDays { get; set; }
        public DateTime ReportDate { get; set; }
        public int HealthcareProviderId { get; set; }
        public string HealthcareProviderName { get; set; }
        public string HealthcareProviderPracticeNumber { get; set; }
        public string ReportCategory { get; set; }
        public string ReportType { get; set; }
        public int ReportTypeId { get; set; }
        public string ReportStatus { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime ConsultationDate { get; set; }
        public string Icd10Codes { get; set; }
    }
}
