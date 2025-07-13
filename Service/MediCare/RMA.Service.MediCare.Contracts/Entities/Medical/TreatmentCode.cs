namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TreatmentCode : Common.Entities.AuditDetails
    {
        public int TreatmentCodeId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public bool? IsCpt { get; set; }
    }
}
