using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class CrosswalkSearch
    {
        public int TariffId { get; set; }
        public string TariffCode { get; set; }
        public int TariffTypeId { get; set; }
        public string TariffDescription { get; set; }
        public int PractitionerTypeId { get; set; }
        public DateTime TariffDate { get; set; }
        public int MedicalItemId { get; set; }
        public decimal DefaultQuantity { get; set; }
        public decimal TariffAmount { get; set; }
        public int TreatmentCodeId { get; set; }
        public string TreatmentCodeDescription { get; set; }

    }
}
