using Newtonsoft.Json.Linq;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using RMA.Service.MediCare.RuleTasks;

namespace RMA.Service.ClaimCare.RuleTasks.STP.ClaimType
{
    public class ClaimTypeRule : IRule
    {
        public const string RuleName = Constants.ClaimTypeRuleName;
        public string Name { get; } = RuleName;
        public string Code { get; } = "STP03";
        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                List<RuleData> ruleDataList;

                if (context == null || string.IsNullOrWhiteSpace(context.Data))
                    return CreateNoDataRuleResult();

                var data = JToken.Parse(context.Data);

                ruleDataList = data is JArray ? data.ToObject<List<RuleData>>() : new List<RuleData> { data.ToObject<RuleData>() };

                var ruleData = ruleDataList.FirstOrDefault();

                if (ruleData != null)
                {
                    var claimTypeName = GetClaimTypeName(ruleData);
                    return CreateResult(claimTypeName.ToUpper());
                }
                else
                    return CreateNoDataRuleResult();
            }
            catch (Exception ex)
            {
                ex.LogException();
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { ex.Message }
                };
            }
        }

        private static string GetClaimTypeName(RuleData ruleData)
        {
            if (string.IsNullOrWhiteSpace(ruleData.ClaimTypeName))
                throw new BusinessException("Claim type name is required");
            else
                return ruleData.ClaimTypeName;
        }

        private static RuleResult CreateResult(string claimTypeName)
        {
            var iodcoid = ClaimTypeEnum.IODCOID.GetEnumDisplayName().ToUpper();
            var result = new RuleResult
            {
                RuleName = RuleName,
                Passed = claimTypeName.Equals(iodcoid),
                MessageList = new List<string>()
            };

            AddMessages(result);
            return result;
        }

        private RuleResult CreateNoDataRuleResult()
        {
            return new RuleResult
            {
                RuleName = RuleName,
                Passed = false,
                MessageList = new List<string> { "No data was supplied" }
            };
        }

        private static void AddMessages(RuleResult result)
        {
            if (!result.Passed)
                result.MessageList.Add($"Claim Type must be IOD-COID");
        }

       
    }
}
