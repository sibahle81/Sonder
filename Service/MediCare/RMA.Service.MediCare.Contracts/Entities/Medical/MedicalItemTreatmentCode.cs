namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalItemTreatmentCode : Common.Entities.AuditDetails
    {
        public int MedicalItemTreatmentCodeId { get; set; }
        public int TreatmentCodeId { get; set; }
        public int MedicalItemId { get; set; }
    }
}
