namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ChronicScriptMedicineRenewal : Common.Entities.AuditDetails
    {
        public int ChronicScriptMedicineRenewalId { get; set; }
        public int ChronicMedicationFormRenewalId { get; set; }
        public string Description { get; set; }
        public int? Icd10CodeId { get; set; }
        public string MedicinePrescribed { get; set; }
        public string Dosage { get; set; }
        public string Icd10Code { get; set; }
        public byte? NumberOfRepeats { get; set; }
    }
}
