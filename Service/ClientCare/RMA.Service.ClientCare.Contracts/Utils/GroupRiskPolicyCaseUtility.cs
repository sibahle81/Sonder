using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClientCare.Contracts.Utils
{
    public static class GroupRiskPolicyCaseUtility
    {

        public const string FirstYearBrokerComm = "FirstYearBrokerComm";
        public const string RecurringBrokerComm = "RecurringBrokerComm";
        public const string ContractorCover = "ContractorCover";
        public const string PartialWaiverActiveAtWork = "PartialWaiverActiveAtWork";
        public const string PartialWaiverPreExisting = "PartialWaiverPreExisting";
        public const string BinderFee = "BinderFee";
        public const string OutsourceFee = "OutsourceFee";
        public const string OptionTypeCode = "BillingLevel";
        public const string BenefitBillingLevelName = "Benefit";
        public const string CategoryBillingLevelName = "Category";

        public const bool IsPercentageSplit = false;
        public const int RateStatusId = 1;

        public static bool ToBoolFromYesNo(this string value)
        {
            return string.Equals(value, "Yes") ? true : false ;
        }

        public static bool ToBoolFromIncludeExclude(this string value)
        {
            return string.Equals(value, "Included") ? true : false;
        }

        public static string  ToYesOrNoValue(this bool inputValue )
        {
            return inputValue ? "Yes" : "No";
        }
        public static string ToIncludedOrExcludedValue(this bool inputValue)
        {
            return inputValue ? "Included" : "Excluded";
        }

        public static string GetPolicyStringOptionValue(GroupRiskPolicy groupRiskPolicy, string optionTypeCode)
        {
            if (groupRiskPolicy == null)
            {
                return null;
            }

            switch (optionTypeCode)
            {
                case FirstYearBrokerComm :
                    return groupRiskPolicy.FirstYearBrokerCommission.ToYesOrNoValue();
                case ContractorCover:
                    return groupRiskPolicy.AllowContractor.ToIncludedOrExcludedValue();
                case PartialWaiverActiveAtWork:
                    return groupRiskPolicy.PartialWaiverActivelyAtWork.ToIncludedOrExcludedValue();
                case PartialWaiverPreExisting:
                    return groupRiskPolicy.PartialWaiverPreExistingCondition.ToIncludedOrExcludedValue();
                case BinderFee:
                    return groupRiskPolicy.BinderFee.ToString();
                case OutsourceFee:
                    return groupRiskPolicy.OutsourceServiceFee.ToString();
                default:
                    return null;
            }
        }
    }
}
