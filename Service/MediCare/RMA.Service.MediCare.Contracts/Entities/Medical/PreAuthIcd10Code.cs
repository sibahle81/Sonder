namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthIcd10Code : Common.Entities.AuditDetails
    {
        public int PreAuthIcd10CodeId { get; set; }
        public int PreAuthId { get; set; }
        public string Icd10Code { get; set; }
        public int? Icd10CodeId { get; set; }
        public int BodySideId { get; set; }
        public bool IsMatching { get; set; }
        public bool IsAuthorised { get; set; }
        public byte? InjuryType { get; set; }
        public byte? RequesterType { get; set; }
        public bool IsClinicalUpdate { get; set; }
        public short? UpdateSequenceNo { get; set; }
        public int? ClinicalUpdateId { get; set; }
        public string Description { get; set; }
    }
}
