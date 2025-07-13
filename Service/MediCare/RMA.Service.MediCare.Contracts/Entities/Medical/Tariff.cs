namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Tariff : Common.Entities.AuditDetails
    {
        public int TariffId { get; set; }
        public string ItemCode { get; set; }
        public System.DateTime ValidFrom { get; set; }
        public System.DateTime ValidTo { get; set; }
        public int TariffBaseUnitCostId { get; set; }
        public decimal RecommendedUnits { get; set; }
        public int VatCodeId { get; set; }
        public int PractitionerTypeId { get; set; }
        public int TariffTypeId { get; set; }
        public int MedicalItemId { get; set; }
        public int SectionId { get; set; }
        public bool? IsCopiedFromNrpl { get; set; }
    }
}
