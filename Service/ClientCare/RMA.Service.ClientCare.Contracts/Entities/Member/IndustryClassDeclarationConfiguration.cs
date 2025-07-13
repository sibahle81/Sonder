using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class IndustryClassDeclarationConfiguration
    {
        public int IndustryClassDeclarationConfigurationId { get; set; }
        public IndustryClassEnum IndustryClass { get; set; }
        public int RenewalPeriodStartMonth { get; set; }
        public int RenewalPeriodStartDayOfMonth { get; set; }
        public decimal? VarianceThreshold { get; set; }
        public int? OnlineSubmissionStartMonth { get; set; }
        public int? OnlineSubmissionStartDayOfMonth { get; set; }

        public List<MaxAverageEarning> MaxAverageEarnings { get; set; }
        public List<DeclarationPenaltyPercentage> DeclarationPenaltyPercentages { get; set; }
        public List<LiveInAllowance> LiveInAllowances { get; set; }
        public List<InflationPercentage> InflationPercentages { get; set; }
        public List<MinimumAllowablePremium> MinimumAllowablePremiums { get; set; }
    }
}