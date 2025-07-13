using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ICD10CodesJSON
    {
        public int ICD10CodeId { get; set; }
        public string ICD10Code { get; set; }
        public string ICD10CodeDescription { get; set; }
        public string BodySideAffected { get; set; }
        public InjurySeverityTypeEnum Severity { get; set; }
    }
}
