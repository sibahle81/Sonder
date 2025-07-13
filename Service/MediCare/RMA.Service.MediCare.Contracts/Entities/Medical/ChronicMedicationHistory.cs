namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ChronicMedicationHistory : Common.Entities.AuditDetails
    {
        public int ChronicMedicalHistoryId { get; set; }
        public int ChronicMedicationFormId { get; set; }
        public string Disease { get; set; }
        public System.DateTime? DateDiagnosed { get; set; }
        public string Treatment { get; set; }
        public string Icd10Code { get; set; }
        public int? Icd10CodeId { get; set; }
    }
}
