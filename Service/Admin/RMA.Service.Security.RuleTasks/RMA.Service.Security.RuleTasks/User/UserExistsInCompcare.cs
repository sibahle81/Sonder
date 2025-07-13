using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Security.RuleTasks.User.UserExistsInCompcare
{
    public class UserExistsInCompcare : IRule
    {
        private readonly IUserService _userService;

        public const string RuleName = "Find user in Compcare";

        public UserExistsInCompcare(IUserService userService)
        {
            _userService = userService;
        }

        public string Name { get; } = RuleName;

        public string Code { get; } = "CCUSER";

        public string Version { get; } = "1.0";

        public RuleResult Execute(IRuleContext context)
        {
            try
            {
                var ruleData = context.Deserialize<RuleData>(context.Data);

                var newUserEmailAddress = ruleData.User.UserContact.Email;

                var matchingCompcareUserIdsByEmailAddress = FindActiveCompcareUsersByEmailAddressAsyncWrapper(newUserEmailAddress);

                return ValidateInput(newUserEmailAddress, matchingCompcareUserIdsByEmailAddress);
            }
            catch (ArgumentNullException)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { "No data was supplied" }
                };
            }
            catch (Exception ex)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string> { ex.Message }
                };
            }
        }

        private async Task<List<CompcareUser>> FindActiveCompcareUsersByEmailAddressAsync(string emailAddress)
        {
            return await _userService.GetCompcareUsersByEmailAddress(emailAddress).ConfigureAwait(false);
        }

        private List<CompcareUser> FindActiveCompcareUsersByEmailAddressAsyncWrapper(string emailAddress)
        {
            return Task.Run<List<CompcareUser>>(async () => await FindActiveCompcareUsersByEmailAddressAsync(emailAddress).ConfigureAwait(false)).Result;
        }

        private RuleResult ValidateInput(string newUserEmailAddress, List<CompcareUser> matchingCompcareUserIdsByEmailAddress)
        {
            if (matchingCompcareUserIdsByEmailAddress == null || !matchingCompcareUserIdsByEmailAddress.Any())
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string>
                        {
                            $"No matching user found in Compcare with email address '{ newUserEmailAddress}', please register on Compcare using the same email address before proceeding with registration."
                        }
                };
            }
            else if (matchingCompcareUserIdsByEmailAddress.Count == 1)
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = true,
                    MessageList = new List<string>()
                };
            }
            else
            {
                return new RuleResult
                {
                    RuleName = RuleName,
                    Passed = false,
                    MessageList = new List<string>
                        {
                            $"Multiple user profiles found in Compcare that match the same email address '{ newUserEmailAddress}', please contact helpdesk to ensure your email address is unique on Compcare before proceeding with registration."
                        }
                };
            }
        }

    }
}