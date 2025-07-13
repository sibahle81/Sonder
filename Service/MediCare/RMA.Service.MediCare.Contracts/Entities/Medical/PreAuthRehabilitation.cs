namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthRehabilitation : Common.Entities.AuditDetails
    {
        public int PreAuthRehabilitationId { get; set; }
        public int PreAuthId { get; set; }
        public bool IsNewRequest { get; set; }
        public string TherapistName { get; set; }
        public System.DateTime InitialConsultationDate { get; set; }
        public string TreatmentFrequency { get; set; }
        public string TreatmentDuration { get; set; }
        public int? TreatmentSessionCount { get; set; }
        public int? TreatmentSessionCompletedCount { get; set; }
        public int? TreatmentSessionAdditionalCount { get; set; }
        public System.DateTime? ExtensionAuthFromDate { get; set; }
        public System.DateTime? ExtensionAuthToDate { get; set; }
        public int? ReferringDoctorId { get; set; }
        public string ReferringDoctorContact { get; set; }
        public string RehabilitationGoal { get; set; }
        public bool RequestStatus { get; set; }
        public string HealthCareProviderName { get; set; }
    }
}
