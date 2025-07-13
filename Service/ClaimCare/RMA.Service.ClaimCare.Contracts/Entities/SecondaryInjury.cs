using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class SecondaryInjury : Common.Entities.AuditDetails
    {
        public int SecondaryInjuryId { get; set; } // SecondaryInjuryId (Primary key)
        public int PrimaryInjuryId { get; set; } // PrimaryInjuryId
        public int Icd10CodeId { get; set; } // ICD10CodeId
        public BodySideAffectedTypeEnum? BodySideAffectedType { get; set; } // BodySideAffectedId
        public InjurySeverityTypeEnum? InjurySeverityType { get; set; } // InjurySeverityId
        public InjuryStatusEnum? InjuryStatus { get; set; } // InjuryStatusId
    }
}
