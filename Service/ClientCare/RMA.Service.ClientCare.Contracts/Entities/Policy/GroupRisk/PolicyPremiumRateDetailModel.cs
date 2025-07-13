using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PolicyPremiumRateDetailModel
    {
        public int PolicyPremiumRateDetailId { get; set; }
        public int PolicyId { get; set; }
        public int BenefitRateId { get; set; }
        public int BenefitDetailId { get; set; }  
        public string PolicyName { get; set; }
        public int BenefitId { get; set; }
        public string BenefitName { get; set; }
        public int? BenefitCategoryId { get; set; }
        public string BenefitCategoryName { get; set; }
        public string BillingLevelCode { get; set; }
        public string BillingLevelName { get; set; }
        public string BillingMethodCode { get; set; }
        public string BillingMethodName { get; set; }
        public int ReinsuranceTreatyId { get; set; }
        public string ReinsuranceTreatyName { get; set; }
        public decimal? ReinsuranceTreatyReassValue { get; set; }
        public decimal? ReinsuranceTreatyRmlValue { get; set; }
        decimal? ReinsuranceTreatyReassPercentage { get; set; }
        public decimal? ReinsuranceTreatyRmlPercentage { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime LastUpdateDate { get; set; }
        public decimal TotalRate { get; set; }
        public DateTime EffectiveDate { get; set; }
        public List<PremiumRateComponentModel> PremiumRateComponentModels { get; set; }
        public List<BenefitReinsuranceAverageModel> BenefitReinsuranceAverageModels { get; set; }

        public PolicyPremiumRateDetailModel()
        {
            PremiumRateComponentModels = new List<PremiumRateComponentModel>();
            BenefitReinsuranceAverageModels = new List<BenefitReinsuranceAverageModel>();
        }

    }
}
