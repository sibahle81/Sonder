using RMA.Service.ClientCare.Contracts.Entities.Policy;
using System;

namespace RMA.Service.ClientCare.Contracts.Utils
{
    public static class PolicyPremiumCalculationHelper
    {
        /// <summary>
        /// Calculate the premium for a funeral policy.
        /// For policies whose inception date is before November 2023, the amount has to be rounded off to nearest rand value
        /// </summary>
        /// <param name="funeralPolicyPremiumCalculation"></param>
        /// <returns>Premium amount in decimal format</returns>
        public static decimal CalculateFuneralPolicyPremium(FuneralPolicyPremiumCalculation funeralPolicyPremiumCalculation, bool allowRoundOff = false)
        {
            if (funeralPolicyPremiumCalculation == null)
                return 0M;

            var calculatedPremium = 0M;
            var totalBaseRate = Math.Abs(funeralPolicyPremiumCalculation.BaseRate);
            var premiumAdjustmentPercentage = funeralPolicyPremiumCalculation.PremiumAdjustmentPercentage;
            var commissionPercentage = funeralPolicyPremiumCalculation.CommissionPercentage;
            var binderFeePercentage = funeralPolicyPremiumCalculation.BinderFeePercentage;
            var administrationPercentage = funeralPolicyPremiumCalculation.AdministrationPercentage;
            var inceptionDate = funeralPolicyPremiumCalculation.PolicyInceptionDate;
            var groupRoundingCutoffDate = funeralPolicyPremiumCalculation.GroupRoundingCutoffDate;

            if (totalBaseRate > 0)
            {
                if (premiumAdjustmentPercentage > 0)
                {
                    totalBaseRate += (totalBaseRate * premiumAdjustmentPercentage);
                }

                var officePremium = totalBaseRate / (1 - (commissionPercentage + binderFeePercentage));
                var adminFee = officePremium * administrationPercentage;

                calculatedPremium = Math.Round(adminFee, 2, MidpointRounding.AwayFromZero)
                                    + Math.Round(officePremium, 2, MidpointRounding.AwayFromZero);
            }

            if(inceptionDate != DateTime.MinValue && inceptionDate < groupRoundingCutoffDate && allowRoundOff)
            {
                calculatedPremium = Math.Round(calculatedPremium, 0);
            }

            return calculatedPremium;
        }
    }
}
