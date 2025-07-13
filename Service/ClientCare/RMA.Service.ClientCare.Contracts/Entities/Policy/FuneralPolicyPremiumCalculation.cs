using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class FuneralPolicyPremiumCalculation
    {
        public decimal AdministrationPercentage { get; set; }
        public decimal BaseRate { get; set; }
        public decimal BinderFeePercentage { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal PremiumAdjustmentPercentage { get; set; }
        public DateTime? PolicyInceptionDate { get; set; }
        public DateTime? GroupRoundingCutoffDate { get; set; }
    }
}
