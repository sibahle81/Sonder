using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class DuplicateLineItem
    {
        public int PersonEventId { get; set; }
        public int HealthCareProviderId { get; set; }
        public DateTime ServiceDate { get; set; }
        public string TariffCode { get; set; }
        public int MedicalItemId { get; set; }
        public int InvoiceLineId { get; set; }
    }
}
