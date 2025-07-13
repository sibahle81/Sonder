namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthMotivationForClaimReopening : Common.Entities.AuditDetails
    {
        public int PreAuthMotivationForClaimReopeningId { get; set; }
        public int PreAuthId { get; set; }
        public int? ReferringDoctorId { get; set; }
        public int? RequestStatusId { get; set; }
        public string InjuryDetails { get; set; }
        public string RelationWithOldInjury { get; set; }
        public System.DateTime? AdmissionDate { get; set; }
        public System.DateTime ProcedureDate { get; set; }
        public string Motivation { get; set; }
        public string Comment { get; set; }
        public string SubmittedByUser { get; set; }
        public System.DateTime SubmittedDate { get; set; }
    }
}
