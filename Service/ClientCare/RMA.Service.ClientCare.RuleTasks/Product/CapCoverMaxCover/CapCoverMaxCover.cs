using RMA.Common.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.RuleTasks.Product.CapCoverMaxCover
{
    public class CapCoverMaxCover : CapCoverBase, IRule
    {
        public const string RuleName = "Cap Cover per Member";
        public override string Name { get; } = RuleName;
        public string Code { get; } = "PROD04";
        public string Version { get; } = "1.0";
        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;

        public CapCoverMaxCover(ISendEmailService sendEmailService, IConfigurationService configurationService)
        {
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
        }

        public RuleResult Execute(IRuleContext context)
        {
            Contract.Requires(context != null);

            var newCase = context.Deserialize<Case>(context.Data);
            var metaData = context.Deserialize<List<DecimalMetaData>>(context.ConfigurableData);
            if (metaData != null && metaData.Count > 0)
            {
                var value = Task.Run(
                    async () =>
                    {
                        var result = await ProcessRule( newCase);
                        return result;
                    }
                );
                return value?.Result;
            }
            return GetRuleResult();
        }

        private async Task<RuleResult> ProcessRule(Case data)
        {
            var policyId = GetPolicyId(data);

            await ProcessRule(data.MainMember);
            await ProcessRule(data.Spouse);
            await ProcessRule(data.Children);
            await ProcessRule(data.ExtendedFamily);
            return GetRuleResult();
        }

        private async Task ProcessRule(List<RolePlayer> members)
        {
            if (members == null) return;
            foreach (var member in members)
            {
                await ProcessRule(member);
            }
        }

        private async Task ProcessRule(RolePlayer member)
        {
            if (member.Person != null)
            {
                // ASD Request 136084 - Exclude cover on other policies, cap only applies to current policy
                // var existingCover = await GetCurrentCoverAmount(member, excludePolicyId);
                const decimal existingCover = 0;

                DateTime zeroTime = new DateTime(1, 1, 1);
                var date = member.JoinDate.HasValue && member.JoinDate.Value > DateTime.MinValue ? member.JoinDate.Value : DateTime.Today;
                TimeSpan span = DateTime.Now - date;
                int policyYears = (zeroTime + span).Year - 1;
                var newCover = GetNewCoverAmount(member);
                var generalMaxCoverAmount = (await _configurationService.GetModuleSetting(SystemSettings.MaxBenefitCover));
                var belowTwoYearsMaxCoverAmount = (await _configurationService.GetModuleSetting(SystemSettings.MaxBenefitCoverLessTwoYears));
                if (existingCover + newCover >= decimal.Parse(generalMaxCoverAmount))
                {
                    var sender = (await _configurationService.GetModuleSetting(SystemSettings.MaxBenefitCoverEmailSender));
                    var recipient = (await _configurationService.GetModuleSetting(SystemSettings.MaxBenefitCoverEmailRecipient));

                    var msg = $"Adding {newCover:N2} to existing cover of {existingCover:N2} will exceed cover cap of {decimal.Parse(generalMaxCoverAmount):N2} for {member.DisplayName}";
                    if (policyYears < 2)
                    {
                        msg = $"Adding {newCover:N2} to existing cover of {existingCover:N2} will exceed cover cap of {decimal.Parse(belowTwoYearsMaxCoverAmount):N2} for {member.DisplayName}";
                    }
                    var emailRequest = new SendMailRequest
                    {
                        FromAddress = sender,
                        Recipients = recipient,
                        Subject = $"RMA Funeral Plan Policy over capped amount of R104,000: for member {member.Person.FirstName} {member.Person.Surname}",
                        Body = msg,
                        IsHtml = false
                    };
                    await SendEmailForCoverGreaterThanMaxCover(emailRequest);
                    AddErrorMessage(msg);
                }
            }
        }

        public async Task<bool> SendEmailForCoverGreaterThanMaxCover(SendMailRequest emailRequest)
        {
            await _sendEmailService.SendEmail(emailRequest);
            return true;
        }
    }
}
