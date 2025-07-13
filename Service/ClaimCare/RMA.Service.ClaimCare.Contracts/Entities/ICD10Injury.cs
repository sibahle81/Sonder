namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ICD10Injury
    {
        public int ICD10CodeId { get; set; }
        public string ICD10Code { get; set; }
        public int BodySideId { get; set; }
        public int ICD10DiagnosticGroupId { get; set; }
        public string ICD10DiagnosticGroupCode { get; set; }
        public int ICD10CategoryId { get; set; }
        public string ICD10CategoryCode { get; set; }
        public bool IsPrimary { get; set; }
    }
}
