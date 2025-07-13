namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceReportMap : Common.Entities.AuditDetails
    {
        public int InvoiceReportMapId { get; set; }
        public int InvoiceId { get; set; }
        public int MedicalReportId { get; set; }
        public int ToleranceDays { get; set; }
    }
}
