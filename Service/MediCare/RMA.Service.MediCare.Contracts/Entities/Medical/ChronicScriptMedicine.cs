namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ChronicScriptMedicine : Common.Entities.AuditDetails
    {
        public int ChronicScriptMedicineId { get; set; }
        public int ChronicMedicationFormId { get; set; }
        public string Description { get; set; }
        public int? Icd10CodeId { get; set; }
        public string MedicinePrescribed { get; set; }
        public string Dosage { get; set; }
        public bool IsPreExistOrChronic { get; set; }
        public string Icd10Code { get; set; }
        public byte? NumberOfRepeats { get; set; }
    }
}
