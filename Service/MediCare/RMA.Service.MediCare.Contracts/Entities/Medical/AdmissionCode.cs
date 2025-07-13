namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class AdmissionCode : Common.Entities.AuditDetails
    {
        public int AdmissionCodeId { get; set; }
        public string ItemCode { get; set; }
        public string Description { get; set; }
        public int PractitionerTypeId { get; set; }
        public int? LevelOfCareId { get; set; }
        public bool? IsFullDayAlways { get; set; }
    }
}
