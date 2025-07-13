namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TreatmentPlan : Common.Entities.AuditDetails
    {
        public int TreatmentPlanId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
