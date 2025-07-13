
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimEstimate
    {
        public int ClaimEstimateId { get; set; }
        public int PersonEventId { get; set; }
        public int? BenefitId { get; set; }
        public decimal? EstimatedExtent { get; set; }
        public decimal? EstimatedValue { get; set; }
        public decimal? EstimatedDaysOff { get; set; }
        public decimal? AllocatedExtent { get; set; }
        public decimal? AllocatedValue { get; set; }
        public decimal? AllocatedDaysOff { get; set; }
        public decimal? AuthorisedExtent { get; set; }
        public decimal? AuthorisedValue { get; set; }
        public decimal? AuthorisedDaysOff { get; set; }
        public decimal? SettledExtent { get; set; }
        public decimal? SettledValue { get; set; }
        public decimal? SettledDaysOff { get; set; }
        public int? EarningsId { get; set; }
        public bool IsOverrideExtent { get; set; }
        public bool IsOverrideValue { get; set; }
        public bool IsOverrideDaysOff { get; set; }
        public bool IsFinalised { get; set; }
        public string CalcOperands { get; set; }
        public decimal? OutstandingValue { get; set; }
        public decimal? OutstandingExtent { get; set; }
        public decimal? OutstandingDaysOff { get; set; }
        public decimal? AutoIncreasedAmount { get; set; }
        public decimal? OutstandingReserved { get; set; }
        public bool? AutomatedStpProcess { get; set; }
        public string Notes { get; set; }
        public decimal? EstimatedValueExclVat { get; set; }
        public decimal? EstimatedValueVat { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public EstimateTypeEnum? EstimateType { get; set; }
        public int OutstandingPd { get; set; }
        public int AuthorisedPd { get; set; }
        public int EstimatePd { get; set; }
        public int? ClaimId { get; set; }

        public EstimateType EstimateTypes { get; set; }

    }
}
