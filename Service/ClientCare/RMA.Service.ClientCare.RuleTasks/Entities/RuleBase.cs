using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;

namespace RMA.Service.ClientCare.RuleTasks.Entities
{

    public abstract class RuleBase
    {

        public abstract string Name { get; }
        private readonly List<string> errorList = new List<string>();

        protected RuleResult GetRuleResult(bool passed, string message)
        {
            AddErrorMessage(message);
            return GetRuleResult(passed);
        }

        protected static int GetAgeAt(DateTime dateOfBirth, DateTime date)
        {
            int age = date.Year - dateOfBirth.Year;
            if (date.Month < dateOfBirth.Month || (date.Month == dateOfBirth.Month && date.Day < dateOfBirth.Day))
                age--;
            return age < 0 ? 0 : age;
        }

        protected DateTime GetTestDate(RolePlayer rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            if (GetRolePlayerTypeId(rolePlayer) == RolePlayerTypeEnum.Child)
            {
                return DateTime.Today;
            }
            else if (rolePlayer.JoinDate.HasValue)
            {
                return rolePlayer.JoinDate.Value;
            }
            else
            {
                return DateTime.Today;
            }
        }

        private static RolePlayerTypeEnum GetRolePlayerTypeId(RolePlayer rolePlayer)
        {
            if (rolePlayer.FromRolePlayers != null)
            {
                var list = rolePlayer.FromRolePlayers
                    .Where(s => s.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary)
                    .ToList();
                if (list != null && list.Count > 0)
                {
                    return (RolePlayerTypeEnum)list[0].RolePlayerTypeId;
                }
            }
            return RolePlayerTypeEnum.Other;
        }

        protected RuleResult GetRuleResult(bool passed)
        {
            var ruleResult = new RuleResult
            {
                Passed = passed,
                RuleName = Name,
                MessageList = errorList
            };
            return ruleResult;
        }

        protected RuleResult GetRuleResult()
        {
            return GetRuleResult(errorList.Count == 0);
        }

        protected void AddErrorMessage(string message)
        {
            if (!string.IsNullOrEmpty(message))
            {
                errorList.Add(message);
            }
        }
    }
}
