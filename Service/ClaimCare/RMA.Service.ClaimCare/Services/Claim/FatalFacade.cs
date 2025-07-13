using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Fabric;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using RuleRequest = RMA.Service.ClaimCare.Contracts.Entities.RuleRequest;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class FatalFacade : RemotingStatelessService, IFatalService
    {
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IEventService _eventService;
        private readonly IConfigurationService _configurationService;
        private const int SuicideWaitingPeriod = 365;
        private const int NaturalCauseBelow65WaitingPeriod = 180;
        private const int NaturalCauseAbove65WaitingPeriod = 180;
        private const int MaxJoinPeriodForWaiving = 31;
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";


        public FatalFacade(StatelessServiceContext context,
            IPolicyService policyService,
            IRolePlayerService rolePlayerService,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<claim_PersonEvent> personEventRepository,
            IEventService eventService,
            IConfigurationService configurationService
           )
            : base(context)
        {
            _policyService = policyService;
            _rolePlayerService = rolePlayerService;
            _dbContextScopeFactory = dbContextScopeFactory;
            _personEventRepository = personEventRepository;
            _eventService = eventService;
            _configurationService = configurationService;
        }

        public async Task<PersonEvent> GetFatal(int personEventId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _personEventRepository
                    .Where(a => a.PersonEventId == personEventId).FirstOrDefaultAsync();
                var personEventDeathDetail = await _eventService.GetPersonEventDeathDetail(personEventId);
                return Mapper.Map<PersonEvent>(data);
            }
        }

        public async Task<FuneralRuleResult> ExecuteFuneralClaimRegistrationRules(RuleRequest ruleRequest)
        {
            var ruleResult = new FuneralRuleResult
            {
                RuleName = "Funeral Registration Rules"
            };
            await DateOfDeathBeforePolicyDocRule(ruleRequest, ruleResult);
            await ChildAgeRule(ruleRequest, ruleResult);
            await FirstPremiumRule(ruleRequest, ruleResult);
            await WaitingPeriodRule(ruleRequest, ruleResult);

            ruleResult.Passed = ruleResult.MessageList.Count <= 0;

            return ruleResult;
        }

        private async Task DateOfDeathBeforePolicyDocRule(RuleRequest ruleRequest, FuneralRuleResult ruleResult)
        {
            var policy = await GetPolicy(ruleRequest);
            var insuredLife = await GetRolePlayer(ruleRequest);

            if (insuredLife.CreatedDate > ruleRequest.DeathDate)
            {
                ruleResult.MessageList.Add(1, "Date of death occurred before insured life was added to the policy");
            }
            PolicyStatusRule(policy, ruleResult);
        }

        private async Task ChildAgeRule(RuleRequest ruleRequest, FuneralRuleResult ruleResult)
        {
            var policy = await GetPolicy(ruleRequest);
            var insuredLife = await _rolePlayerService.GetRolePlayer(ruleRequest.DeceasedId);
            var age = GetAge(insuredLife.Person.DateOfBirth);
            var isChildRole = insuredLife.FromRolePlayers.Any(a => a.FromRolePlayerId == ruleRequest.DeceasedId && a.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child);
            var isStillborn = ruleRequest.DeathTypeId == (int)DeathTypeEnum.Stillborn;

            if (isChildRole && !isStillborn && policy.ProductOptionId != 14)
            {
                if (!insuredLife.Person.IsDisabled && (!insuredLife.Person.IsStudying && age > 21))
                {
                    ruleResult.MessageList.Add(2, "Child older than 21");
                }
                if (insuredLife.Person.IsStudying && age > 24)
                {
                    ruleResult.MessageList.Add(2, "Child older than 21");
                }
            }
        }

        private async Task<Policy> GetPolicy(RuleRequest ruleRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _policyService.GetPolicyByPolicyId(ruleRequest.PolicyId);
            }
        }

        private async Task<RolePlayer> GetRolePlayer(RuleRequest ruleRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rolePlayerService.GetRolePlayer(ruleRequest.DeceasedId);
            }
        }

        private void PolicyStatusRule(Policy policy, FuneralRuleResult ruleResult)
        {
            if (policy.CancellationDate != null)
            {
                ruleResult.MessageList.Add(3, "Policy cancelled");
            }

            if (policy.PolicyStatus == PolicyStatusEnum.Lapsed)
            {
                ruleResult.MessageList.Add(3, "Policy Lapsed");
            }

        }

        private async Task FirstPremiumRule(RuleRequest ruleRequest, FuneralRuleResult ruleResult)
        {
            var policy = await GetPolicy(ruleRequest);

            var status = policy.PolicyStatus;

            if (status == PolicyStatusEnum.PendingFirstPremium)
            {
                ruleResult.MessageList.Add(5, "1st premium has not yet been paid");
            }
        }

        private async Task WaitingPeriodRule(RuleRequest ruleRequest, FuneralRuleResult ruleResult)
        {
            var insuredLifeDateOfBirth = await GetDateOfBirth(ruleRequest);
            var insuredLifeAge = GetAge(insuredLifeDateOfBirth);
            var daysFromRoleCreationDate = await GetDaysFromRolePlayerCreatedDate(ruleRequest);
            var appliedWaitingPeriod = GetAppliedWaitingPeriod(insuredLifeAge, ruleRequest);
            var daysOfPreviousPolicy = await GetPreviousInsuranceTerm(ruleRequest.DeceasedId);
            var daysBetweenNewOldPolicy = await GetLenghthBetweenInsurances(ruleRequest);
            var daysOfCurrentPolicy = await GetDaysFromRmaJoinDate(ruleRequest);
            var daysFromRoleCreationDatewithPreviousInsurancedays = daysOfCurrentPolicy + daysOfPreviousPolicy;


            // NATURAL, STILLBORN, SUICIDE
            if ((ruleRequest.DeathTypeId == (int)DeathTypeEnum.Natural || ruleRequest.DeathTypeId == (int)DeathTypeEnum.Stillborn || ruleRequest.DeathTypeId == (int)DeathTypeEnum.Suicide)
                 && daysFromRoleCreationDate < appliedWaitingPeriod && daysBetweenNewOldPolicy > MaxJoinPeriodForWaiving)
            {
                ruleResult.MessageList.Add(6, "Policy within the waiting period");
            }


            if ((ruleRequest.DeathTypeId == (int)DeathTypeEnum.Natural || ruleRequest.DeathTypeId == (int)DeathTypeEnum.Stillborn || ruleRequest.DeathTypeId == (int)DeathTypeEnum.Suicide)
                && daysFromRoleCreationDatewithPreviousInsurancedays < appliedWaitingPeriod && daysBetweenNewOldPolicy <= MaxJoinPeriodForWaiving)
            {
                ruleResult.MessageList.Add(6, "Policy within the waiting period(Previous Insurer)");

            }

            if ((ruleRequest.DeathTypeId == (int)DeathTypeEnum.Natural || ruleRequest.DeathTypeId == (int)DeathTypeEnum.Stillborn || ruleRequest.DeathTypeId == (int)DeathTypeEnum.Suicide)
                && daysFromRoleCreationDatewithPreviousInsurancedays > appliedWaitingPeriod && daysBetweenNewOldPolicy <= MaxJoinPeriodForWaiving)
            {
                ruleResult.MessageList.Add(6, "The waiting period has been waved");

            }

            var hasPaidFirstPremium = await IsFirstPremiumPaid(ruleRequest);

            // UNNATURAL
            if (ruleRequest.DeathTypeId == (int)DeathTypeEnum.Unnatural && !hasPaidFirstPremium)
            {
                ruleResult.MessageList.Add(7, "Unnatural Death, first premium has not been paid");
            }
        }

        private static int GetAge(DateTime dateOfBirth)
        {
            var age = (int.Parse(DateTime.Today.ToString("yyyyMMdd")) - int.Parse(dateOfBirth.ToString("yyyyMMdd"))) / 10000;
            if (dateOfBirth > DateTime.Today.AddYears(-age))
                age--;

            return age;
        }

        private static int GetAppliedWaitingPeriod(int age, RuleRequest ruleRequest)
        {
            int appliedWaitingPeriod;
            if (ruleRequest.DeathTypeId == (int)DeathTypeEnum.Suicide)
            {
                appliedWaitingPeriod = SuicideWaitingPeriod;
            }
            else if (age < 65)
            {
                appliedWaitingPeriod = NaturalCauseBelow65WaitingPeriod;
            }
            else
            {
                appliedWaitingPeriod = NaturalCauseAbove65WaitingPeriod;
            }

            return appliedWaitingPeriod;
        }

        private async Task<DateTime> GetDateOfBirth(RuleRequest ruleRequest)
        {
            var insuredLife = await _rolePlayerService.GetRolePlayer(ruleRequest.DeceasedId);
            if (!string.IsNullOrEmpty(insuredLife.Person.IdNumber) && ruleRequest.DeathTypeId != (int)DeathTypeEnum.Stillborn)
            {
                var compare = insuredLife.Person.IdNumber;
                var regex = new Regex(@"^[0-9]+$");

                if (regex.IsMatch(compare) && insuredLife.Person.IdType == IdTypeEnum.SAIDDocument)
                {
                    var year = Convert.ToInt32(insuredLife.Person.IdNumber.Substring(0, 2));
                    if (year < 20) year += 2000;
                    else year += 1900;

                    var month = Convert.ToInt32(insuredLife.Person.IdNumber.Substring(2, 2));
                    var day = Convert.ToInt32(insuredLife.Person.IdNumber.Substring(4, 2));
                    return new DateTime(year, month, day);
                }

                return insuredLife.Person.DateOfBirth;
            }

            if (ruleRequest.DeathTypeId == (int)DeathTypeEnum.Stillborn)
            {
                return Convert.ToDateTime(ruleRequest.DeathDate);
            }
            else
            {
                return insuredLife.Person.DateOfBirth;
            }
        }

        private async Task<int> GetDaysFromInceptionDate(RuleRequest ruleRequest)
        {
            var policy = await GetPolicy(ruleRequest);

            if (policy.LastReinstateDate != null && (Convert.ToDateTime(policy.LastReinstateDate) - Convert.ToDateTime(policy.PolicyInceptionDate)).TotalDays < 180)
            {
                return Convert.ToInt32((DateTime.Today - Convert.ToDateTime(policy.LastReinstateDate)).TotalDays);
            }

            return Convert.ToInt32((DateTime.Today - Convert.ToDateTime(policy.PolicyInceptionDate)).TotalDays);
        }

        private async Task<int> GetDaysFromRmaJoinDate(RuleRequest ruleRequest)
        {
            var insuredLife = await _policyService.GetPolicyInsuredLife(ruleRequest.PolicyId, ruleRequest.DeceasedId);
            DateTime insuredLifeJoinDate = (DateTime)insuredLife.StartDate;

            return Convert.ToInt32((DateTime.Today - insuredLifeJoinDate.Date).Days);
        }

        private async Task<int> GetDaysFromRolePlayerCreatedDate(RuleRequest ruleRequest)
        {
            var insuredLife = await GetRolePlayer(ruleRequest);
            var todayDate = DateTimeHelper.SaNow;

            return Convert.ToInt32((todayDate - Convert.ToDateTime(insuredLife.CreatedDate)).TotalDays);
        }

        private async Task<bool> IsFirstPremiumPaid(RuleRequest ruleRequest)
        {
            var hasPaidFirstPremium = true;
            var policy = await GetPolicy(ruleRequest);
            var status = policy.PolicyStatus;

            if (status == PolicyStatusEnum.PendingFirstPremium)
            {
                hasPaidFirstPremium = false;
            }
            return hasPaidFirstPremium;
        }

        private async Task<int> GetPreviousInsuranceTerm(int rolePlayerId)
        {

            var previousInsurerRolePlayer = await _rolePlayerService.GetPreviousInsurerRolePlayer(rolePlayerId);
            return previousInsurerRolePlayer != null ? (previousInsurerRolePlayer.PolicyEndDate.Date - previousInsurerRolePlayer.PolicyStartDate.Date).Days : 0;

        }

        private async Task<int> GetLenghthBetweenInsurances(RuleRequest ruleRequest)
        {

            var previousPolicyEnd = await _rolePlayerService.GetPreviousInsurerRolePlayer(ruleRequest.DeceasedId);
            var currentPolicy = await _policyService.GetPolicyInsuredLife(ruleRequest.PolicyId, ruleRequest.DeceasedId);



            if (previousPolicyEnd != null && currentPolicy != null)
            {
                DateTime currentPolicyStart = (DateTime)currentPolicy.StartDate;
                return (currentPolicyStart.Date - previousPolicyEnd.PolicyEndDate.Date).Days;
            }
            else
            {
                return 0;
            }

        }
    }
}
