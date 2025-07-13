namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class CompCareMedicalReportResult
    {
        public bool IsMSPRequireMedReport { get; set; }
        public bool IsMedReportFound { get; set; }
        public int UnderAssessReasonID { get; set; }
    }
}
