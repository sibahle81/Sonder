namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ClinicalUpdateTreatmentPlan : Common.Entities.AuditDetails
    {
        public int ClinicalUpdateTreatmentPlanId { get; set; }
        public int ClinicalUpdateId { get; set; }
        public int TreatmentPlanId { get; set; }
        public string TreatmentPlanDescription { get; set; }
    }
}
