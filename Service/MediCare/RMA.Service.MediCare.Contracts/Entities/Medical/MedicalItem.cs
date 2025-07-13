namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalItem : Common.Entities.AuditDetails
    {
        public int MedicalItemId { get; set; }
        public string ItemCode { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int MedicalItemTypeId { get; set; }
        public int TreatmentCodeId { get; set; }
        public int NappiCodeId { get; set; }
        public decimal DefaultQuantity { get; set; }
        public int AcuteMedicalAuthNeededTypeId { get; set; }
        public int ChronicMedicalAuthNeededTypeId { get; set; }
        public bool IsAllowSameDayTreatment { get; set; }
        public int? PublicationId { get; set; }
        public System.DateTime? EffectiveFrom { get; set; }
        public System.DateTime? EffectiveTo { get; set; }
    }
}
