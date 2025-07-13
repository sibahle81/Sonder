using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalInvoiceReport
    {
        public DateTime DateTreatmentFrom { get; set; }
        public DateTime DateTreatmentTo { get; set; }
        public DateTime ReportDate { get; set; }
        public int ReportId { get; set; }
    }
}
