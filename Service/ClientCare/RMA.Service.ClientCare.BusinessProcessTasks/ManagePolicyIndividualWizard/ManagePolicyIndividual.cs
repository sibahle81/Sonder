using Microsoft.Extensions.Logging;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Contracts.Utils;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ManagePolicyIndividualWizard
{
    public class ManagePolicyIndividual : IWizardProcess
    {
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IPolicyCaseService _caseService;
        private readonly IProductService _productService;
        private readonly IProductOptionService _productOptionService;
        private readonly IBenefitService _benefitService;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly IPolicyService _policyService;
        private readonly IInvoiceService _invoiceService;
        private readonly IConfigurationService _configurationService;
        private readonly IUserService _userService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IQLinkService _qLinkService;
        private readonly IPeriodService _periodService;

        private readonly IBillingFuneralPolicyChangeService _billingFuneralPolicyChangeService;
        private readonly ILoggerFactory _loggerFactory;
        
        private int[] ageRules = new int[] { 11, 12, 13, 14 };

        private const string PolicyAmendmentNotificationFlag = "AmendmentLetterFlag";
        public const string PolicyChangesQueueName = "mcc.fin.billingpolicychanges";

        private class CaseAmendmentData : Case
        {
            public bool AmendEmail { get; set; }
            public bool AmendContact { get; set; }
            public bool AmendPostal { get; set; }
            public bool AmendBanking { get; set; }

        };

        public ManagePolicyIndividual(
            IRolePlayerPolicyService rolePlayerPolicyService,
            IPolicyCaseService caseService,
            IProductService productService,
            IProductOptionService productOptionService,
            IBenefitService benefitService,
            IWizardService wizardService,
            ISerializerService serializer,
            IPolicyService policyService,
            IInvoiceService invoiceService,
            ITransactionCreatorService transactionCreatorService,
            IConfigurationService configurationService,
            IPolicyCommunicationService communicationService,
            IRolePlayerService rolePlayerService,
            IUserService userService,
            IQLinkService qLinkService,
            IBillingFuneralPolicyChangeService billingFuneralPolicyChangeService,
            IPeriodService periodService,
            ILoggerFactory loggerFactory)
        {
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _caseService = caseService;
            _productService = productService;
            _productOptionService = productOptionService;
            _benefitService = benefitService;
            _wizardService = wizardService;
            _serializer = serializer;
            _policyService = policyService;
            _invoiceService = invoiceService;
            _transactionCreatorService = transactionCreatorService;
            _configurationService = configurationService;
            _communicationService = communicationService;
            _userService = userService;
            _rolePlayerService = rolePlayerService;
            _qLinkService = qLinkService;
            _billingFuneralPolicyChangeService = billingFuneralPolicyChangeService;
            _periodService = periodService;
            _loggerFactory = loggerFactory;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var data = context.Deserialize<Case>(context.Data);
            var caseModel = await _caseService.GetCaseByPolicyId(context.LinkedItemId);
            caseModel.CaseTypeId = (int)CaseTypeEnum.MaintainPolicyChanges;
            caseModel.Code = data.Code;
            var stepData = new ArrayList() { caseModel };
            var label = $"Maintain Policy: {caseModel.Code} - {caseModel.MainMember.DisplayName}";
            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var logger = _loggerFactory.CreateLogger<ManagePolicyIndividual>();

            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var policyCase = context.Deserialize<Case>(stepData[0].ToString());

            var amendmentData = context.Deserialize<CaseAmendmentData>(stepData[0].ToString());
            var sharePolicyChanges = await _configurationService.IsFeatureFlagSettingEnabled(PolicyAmendmentNotificationFlag);
            if (sharePolicyChanges)
            {
                await _communicationService.SendContactChangeMessages(policyCase, amendmentData.AmendEmail, amendmentData.AmendContact, amendmentData.AmendPostal, amendmentData.AmendBanking, false);
            }

            var policy = policyCase.MainMember.Policies[0];

            var existingPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policy.PolicyId);
            var existingExtendedFamilyMembers = await _policyService.GetExtendedFamilyPolicy(policy.PolicyId);
            int existingExtendedFamilyMemberCount = existingExtendedFamilyMembers.Count;

            var oldPolicyPayeeId = existingPolicy.PolicyPayeeId;
            var oldPremium = existingPolicy.InstallmentPremium;

            var newPolicyPayeeId = policy.PolicyPayeeId;
            var newPremium = policy.InstallmentPremium;

            // Make sure the main member is not in any of the other member categories
            policyCase = UpdateMainMemberPolicy(policyCase);

            var joiningDate = DateTimeHelper.SaNow;
            GetToBeAddedMembersEarliestJoiningDate(policyCase, ref joiningDate);

            // Sort extended members by end date before removal.
            // We want the latest end-dated to be above the later dated, e.g. June removal to be before August removal
            // so we can pick the June date as a removal/effective date
            policyCase.ExtendedFamily = policyCase.ExtendedFamily.OrderBy(x => x.EndDate).ToList();

            // Remove all the deleted rolePlayers that have been moved to another section
            // e.g. extended family to child
            var removalDate = DateTimeHelper.SaNow;
            policyCase = RemoveDeletedRolePlayers(policyCase, ref removalDate);
            policyCase = RemoveDuplicateRolePlayers(policyCase);
            policyCase = CheckRolePlayerTypes(policyCase);

            await _rolePlayerPolicyService.EditPolicy(policyCase);
            await _rolePlayerPolicyService.SavePreviousInsurers(policyCase);
            await _rolePlayerPolicyService.UpdatePolicyPremiums(policyCase);

            var newPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policy.PolicyId);
            var newExtendedFamilyMembers = await _policyService.GetExtendedFamilyPolicy(policy.PolicyId);
            int newExtendedFamilyMemberCount = newExtendedFamilyMembers.Count;

            decimal invoiceTotal = newPolicy.InstallmentPremium - existingPolicy.InstallmentPremium;

            if (invoiceTotal != 0)
            {
                // queue policyChanged message for billing processing

                DateTime fromDate = removalDate < joiningDate ? removalDate : joiningDate;
                var fromPeriod = await _periodService.GetPeriodByDate(fromDate);
                var toPeriod = await _periodService.GetPeriodByDate(DateTimeHelper.SaNow);

                if (fromPeriod.Id < toPeriod.Id)
                {
                    var adjustmentAmount = 0M;

                    var newMembers = newExtendedFamilyMembers.Where(newMember => !existingExtendedFamilyMembers
                                        .Any(existingMember => existingMember.RolePlayerId == newMember.RolePlayerId))
                                    .ToList();

                    var removedMembers = existingExtendedFamilyMembers.Where(existingMember => !newExtendedFamilyMembers
                                        .Any(newMember => newMember.RolePlayerId == existingMember.RolePlayerId))
                                    .ToList();

                    if (newMembers.Count > 0)
                    {
                        var newMemberBenefits = await _benefitService.GetBenefitsByBenefitIds(newMembers.Select(x => x.StatedBenefitId).ToList());

                        newMembers.ForEach(x =>
                        {
                            adjustmentAmount = x.Premium.HasValue ? Math.Abs(x.Premium.Value) : 0M;

                            if (x.Premium == null)
                            {
                                var benefit = newMemberBenefits.Where(y => y.Id == x.StatedBenefitId);
                                var premium = benefit.FirstOrDefault()?.BenefitBaseRateLatest;

                                x.Premium = premium.Value;
                                adjustmentAmount += premium.Value;
                            }
                        });
                    }

                    if(removedMembers.Count > 0)
                    {
                        var removedMemberBenefits = await _benefitService.GetBenefitsByBenefitIds(removedMembers.Select(x => x.StatedBenefitId).ToList());

                        removedMembers.ForEach(x =>
                        {
                            x.EndDate = policyCase.ExtendedFamily
                                .FirstOrDefault(y => y.RolePlayerId == x.RolePlayerId)?.EndDate;
                            
                            adjustmentAmount = x.Premium.HasValue ? -1 * Math.Abs(x.Premium.Value) : 0M;

                            if (x.Premium == null && x.EndDate.HasValue)
                            {
                                var benefit = removedMemberBenefits.Where(y => y.Id == x.StatedBenefitId);
                                var premium = benefit.FirstOrDefault()?.BenefitBaseRateLatest;

                                x.Premium = -1 * premium.Value;
                                adjustmentAmount -= premium.Value;
                            }
                        });
                    }

                    var reasonString = "Adjustment Credit Note";
                    var transactionReason =
                        newExtendedFamilyMemberCount > existingExtendedFamilyMemberCount ? $"{reasonString} - " : reasonString;

                    var billingPolicyChangeMessage = new BillingPolicyChangeMessage()
                    {
                        OldPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = existingPolicy.PolicyId,
                            DecemberInstallmentDayOfMonth = existingPolicy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = existingPolicy.FirstInstallmentDate,
                            PolicyInceptionDate = existingPolicy.PolicyInceptionDate,
                            PolicyStatus = existingPolicy.PolicyStatus,
                            InstallmentPremium = existingPolicy.InstallmentPremium,
                            ExtendedFamilyPolicyInsuredLives = existingExtendedFamilyMembers.ToList(),
                            ParentPolicyId = existingPolicy.ParentPolicyId
                        },
                        NewPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = newPolicy.PolicyId,
                            DecemberInstallmentDayOfMonth = newPolicy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = newPolicy.FirstInstallmentDate,
                            PolicyInceptionDate = newPolicy.PolicyInceptionDate,
                            PolicyStatus = newPolicy.PolicyStatus,
                            InstallmentPremium = newPolicy.InstallmentPremium,
                            ExtendedFamilyPolicyInsuredLives = newExtendedFamilyMembers,
                            EffectiveDate = fromPeriod.StartDate,
                            ParentPolicyId = newPolicy.ParentPolicyId,
                            AdministrationPercentage = newPolicy.AdminPercentage,
                            BinderFeePercentage = newPolicy.BinderFeePercentage,
                            CommissionPercentage = newPolicy.CommissionPercentage,
                            PremiumAdjustmentPercentage = newPolicy.PremiumAdjustmentPercentage
                        },
                        RequestedByUsername = SystemSettings.SystemUserAccount,
                        IsGroupPolicy = false,
                        PolicyChangeMessageType = PolicyChangeMessageTypeEnum.MemberCountChange,
                        SourceModule = SourceModuleEnum.ClientCare,
                        AdjustmentAmount = adjustmentAmount,
                        TransactionReason = transactionReason
                    };

                    await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeMessage);
                }
            }

            if (oldPolicyPayeeId != newPolicyPayeeId)
            {
                await _rolePlayerPolicyService.UpdateFinPayee(oldPolicyPayeeId, newPolicyPayeeId);
                await _rolePlayerPolicyService.UpdateBillingTransactionRolePlayer(oldPolicyPayeeId, newPolicyPayeeId);
            }

            if (policy.PolicyInceptionDate.Date != existingPolicy.PolicyInceptionDate.Date)
            {
                var basePremiumAmount = Math.Abs(invoiceTotal);

                // Queue PolicyChanged message for billing processing
                DateTime fromDate = removalDate < joiningDate ? removalDate : joiningDate;
                var fromPeriod = await _periodService.GetPeriodByDate(fromDate);
                var toPeriod = await _periodService.GetPeriod(DateTimeHelper.SaNow);

                if (fromPeriod.StartDate < toPeriod.StartDate)
                {
                    var billingPolicyChangeMessage = new BillingPolicyChangeMessage()
                    {
                        OldPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = existingPolicy.PolicyId,
                            DecemberInstallmentDayOfMonth = existingPolicy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = existingPolicy.FirstInstallmentDate,
                            PolicyInceptionDate = existingPolicy.PolicyInceptionDate,
                            PolicyStatus = existingPolicy.PolicyStatus,
                            ExtendedFamilyPolicyInsuredLives = existingExtendedFamilyMembers
                        },
                        NewPolicyDetails = new BillingPolicyChangeDetail
                        {
                            PolicyId = policy.PolicyId,
                            DecemberInstallmentDayOfMonth = policy.DecemberInstallmentDayOfMonth,
                            FirstInstallmentDate = policy.FirstInstallmentDate,
                            PolicyInceptionDate = policy.PolicyInceptionDate,
                            PolicyStatus = policy.PolicyStatus,
                            ExtendedFamilyPolicyInsuredLives = newExtendedFamilyMembers,
                            AdministrationPercentage = newPolicy.AdminPercentage,
                            BinderFeePercentage = newPolicy.BinderFeePercentage,
                            CommissionPercentage = newPolicy.CommissionPercentage,
                            PremiumAdjustmentPercentage = newPolicy.PremiumAdjustmentPercentage
                        },
                        RequestedByUsername = SystemSettings.SystemUserAccount,
                        IsGroupPolicy = false,
                        PolicyChangeMessageType = PolicyChangeMessageTypeEnum.InceptionDateChange,
                        SourceModule = SourceModuleEnum.ClientCare,
                        AdjustmentAmount = basePremiumAmount
                    };

                    await _billingFuneralPolicyChangeService.ProcessBillingPolicyChanges(billingPolicyChangeMessage);
                }
            }

            await _wizardService.SendWizardNotification("clientcare-notification", "Policy Change Request Actioned", $"Your request to update policy {policy.PolicyNumber} has been sucessfully completed", "", policy.PolicyId, wizard.CreatedBy);

            var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
            var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.ModifiedBy);

            if (isBrokerOnPortal != null)
            {
                var approvedMessage = await _configurationService.GetModuleSetting(SystemSettings.CaseApprovedMessage);
                var request = new RejectWizardRequest()
                {
                    WizardId = wizard.Id,
                    Comment = policyCase.Code + ":" + approvedMessage,
                    RejectedBy = wizard.CreatedBy
                };
                await SendNotification(wizard, request, $": Update Individual Case {policyCase.Code} was Approved");
            }
        }

        private Case CheckRolePlayerTypes(Case policyCase)
        {
            var mainMemberId = policyCase.MainMember.RolePlayerId;
            var policyId = policyCase.MainMember.Policies[0].PolicyId;
            policyCase.Spouse = CheckMemberRolePlayerType(policyId, mainMemberId, policyCase.Spouse, RolePlayerTypeEnum.Spouse);
            policyCase.Children = CheckMemberRolePlayerType(policyId, mainMemberId, policyCase.Children, RolePlayerTypeEnum.Child);
            policyCase.ExtendedFamily = CheckMemberRolePlayerType(policyId, mainMemberId, policyCase.ExtendedFamily, RolePlayerTypeEnum.Extended);
            return policyCase;
        }

        private List<Roleplayer> CheckMemberRolePlayerType(int policyId, int mainMemberId, List<Roleplayer> members, RolePlayerTypeEnum rolePlayerType)
        {
            if (members == null || members.Count == 0) return members;
            foreach (var member in members)
            {
                if (member.FromRolePlayers == null)
                {
                    member.FromRolePlayers = CreateNewFromRolePlayers(policyId, mainMemberId, member.RolePlayerId, rolePlayerType);
                }
            }
            return members;
        }

        private List<RolePlayerRelation> CreateNewFromRolePlayers(int policyId, int mainMemberId, int rolePlayerId, RolePlayerTypeEnum rolePlayerType)
        {
            var relation = new RolePlayerRelation
            {
                Id = 0,
                FromRolePlayerId = rolePlayerId,
                ToRolePlayerId = mainMemberId,
                RolePlayerTypeId = (int)rolePlayerType,
                PolicyId = policyId
            };
            return new List<RolePlayerRelation> { relation };
        }

        private Case UpdateMainMemberPolicy(Case policyCase)
        {
            var mainMemberId = policyCase.MainMember.RolePlayerId;
            policyCase.Spouse = RemoveMember(mainMemberId, policyCase.Spouse);
            policyCase.Children = RemoveMember(mainMemberId, policyCase.Children);
            policyCase.ExtendedFamily = RemoveMember(mainMemberId, policyCase.ExtendedFamily);
            // Make sure the main member is active if not deceased
            if (policyCase.MainMember.Person?.IsAlive == true && policyCase.MainMember.Person?.DateOfDeath.HasValue == false)
            {
                policyCase.MainMember.IsDeleted = false;
                policyCase.MainMember.EndDate = null;
                if (policyCase.MainMember.Person != null)
                {
                    policyCase.MainMember.Person.IsDeleted = false;
                }
            }
            return policyCase;
        }

        private List<Roleplayer> RemoveMember(int mainMemberId, List<Roleplayer> members)
        {
            if (members == null || members.Count == 0) return new List<Roleplayer>();
            return members.Where(m => m.RolePlayerId != mainMemberId).ToList();
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private Case RemoveDuplicateRolePlayers(Case policyCase)
        {
            var memberList = policyCase.Spouse.GetRange(0, policyCase.Spouse.Count);
            foreach (var spouse in memberList)
            {
                policyCase.Spouse = RemoveDeletedMembers(policyCase.Spouse);
                var duplicates = FindDuplicates(policyCase.Spouse, spouse);
                if (duplicates.Count > 1)
                {
                    policyCase.Spouse = RemoveDuplicateMembers(policyCase.Spouse, duplicates);
                }
            }

            memberList = policyCase.Children.GetRange(0, policyCase.Children.Count);
            foreach (var child in memberList)
            {
                policyCase.Children = RemoveDeletedMembers(policyCase.Children);
                var duplicates = FindDuplicates(policyCase.Children, child);
                if (duplicates.Count > 1)
                {
                    policyCase.Children = RemoveDuplicateMembers(policyCase.Children, duplicates);
                }
            }

            memberList = policyCase.ExtendedFamily.GetRange(0, policyCase.ExtendedFamily.Count);
            foreach (var member in memberList)
            {
                policyCase.ExtendedFamily = RemoveDeletedMembers(policyCase.ExtendedFamily);
                var duplicates = FindDuplicates(policyCase.ExtendedFamily, member);
                if (duplicates.Count > 1)
                {
                    policyCase.ExtendedFamily = RemoveDuplicateMembers(policyCase.ExtendedFamily, duplicates);
                }
            }

            return policyCase;
        }

        private List<Roleplayer> RemoveDuplicateMembers(List<Roleplayer> members, List<Roleplayer> duplicates)
        {
            // At this stage all the deleted records of a corresponding active member would have been removed,
            // so we will only be left with all deleted or all active members. Remove all except the last one.
            var removeMembers = duplicates.GetRange(0, duplicates.Count - 1);
            foreach (var member in removeMembers)
            {
                members.Remove(member);
            }
            return members;
        }

        private List<Roleplayer> FindDuplicates(List<Roleplayer> members, Roleplayer member)
        {
            var duplicates = members
                .Where(m => (m.RolePlayerId > 0 && m.RolePlayerId == member.RolePlayerId)
                         || (m.RolePlayerId == 0
                            && m.Person.IdNumber == member.Person.IdNumber
                            && m.Person.DateOfBirth == member.Person.DateOfBirth
                            && m.DisplayName == member.DisplayName))
                .ToList();
            return duplicates;
        }

        private Case RemoveDeletedRolePlayers(Case policyCase, ref DateTime removalDate)
        {
            policyCase.Spouse = RemoveDeletedMembers(policyCase.MainMember, policyCase.Spouse);
            policyCase.Children = RemoveDeletedMembers(policyCase.MainMember, policyCase.Children);
            policyCase.ExtendedFamily = RemoveDeletedMembers(policyCase.MainMember, policyCase.ExtendedFamily);

            foreach (var spouse in policyCase.Spouse)
            {
                if (!spouse.IsDeleted)
                {
                    // Check if there is a deleted entry in children or extendedFamily
                    // members and remove that one if it exists
                    policyCase.Children = RemoveDeletedMembers(spouse, policyCase.Children);
                    policyCase.ExtendedFamily = RemoveDeletedMembers(spouse, policyCase.ExtendedFamily);
                }
                else if (spouse.EndDate?.ToSaDateTime() < removalDate)
                {
                    removalDate = spouse.EndDate.HasValue ? spouse.EndDate.Value.ToSaDateTime() : DateTimeHelper.SaNow.Date;
                }
            }

            foreach (var child in policyCase.Children)
            {
                if (!child.IsDeleted)
                {
                    policyCase.Spouse = RemoveDeletedMembers(child, policyCase.Spouse);
                    policyCase.ExtendedFamily = RemoveDeletedMembers(child, policyCase.ExtendedFamily);
                }
                else if (child.EndDate?.ToSaDateTime() < removalDate)
                {
                    removalDate = child.EndDate.HasValue ? child.EndDate.Value.ToSaDateTime() : DateTimeHelper.SaNow.Date;
                }
            }

            foreach (var member in policyCase.ExtendedFamily)
            {
                if (!member.IsDeleted)
                {
                    policyCase.Spouse = RemoveDeletedMembers(member, policyCase.Spouse);
                    policyCase.Children = RemoveDeletedMembers(member, policyCase.Children);
                }
                else if (member.EndDate?.ToSaDateTime() < removalDate)
                {
                    removalDate = member.EndDate.HasValue ? member.EndDate.Value.ToSaDateTime() : DateTimeHelper.SaNow.Date;
                }
            }
            return policyCase;
        }

        private List<Roleplayer> RemoveDeletedMembers(Roleplayer rolePlayer, List<Roleplayer> members)
        {
            members.RemoveAll(m => m.IsDeleted
                && ((m.RolePlayerId > 0 && m.RolePlayerId == rolePlayer.RolePlayerId)
                 || (m.RolePlayerId == 0 && m.Person.IdNumber == rolePlayer.Person.IdNumber)));
            return members;
        }

        private List<Roleplayer> RemoveDeletedMembers(List<Roleplayer> members)
        {
            members.RemoveAll(m => m.IsDeleted && m.RolePlayerId == 0);
            return members;
        }

        private void GetToBeAddedMembersEarliestJoiningDate(Case policyCase, ref DateTime joiningDate)
        {
            joiningDate = policyCase.ExtendedFamily.Where(x => !x.IsDeleted && x.RolePlayerId == 0).Select(x => x.JoinDate).OrderBy(x => x.Value).FirstOrDefault() ?? joiningDate;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var newCase = context.Deserialize<Case>(stepData[0].ToString());

            var ruleResults = new List<RuleResult>();

            // General funeral validations
            ruleResults.AddRange(await CheckFuneralRules(context, newCase));
            // Validate product
            ruleResults.AddRange(await CheckProductRules(context, newCase));
            // Validate product options
            ruleResults.AddRange(await CheckProductOptionRules(context, newCase));
            // Validate benefits
            ruleResults.AddRange(await CheckBenefitRules(context, newCase));
            //validate role players
            ruleResults.AddRange(await CheckRoleplayersForMultipleRelationsRule(newCase));

            var errors = ruleResults.Where(rr => !rr.Passed).ToList().Count;
            return GetRuleRequestResult(errors == 0, ruleResults);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        private async Task<IEnumerable<RuleResult>> CheckFuneralRules(IWizardContext context, Case newCase)
        {
            var list = new List<RuleResult>();
            var ruleRequest = new RuleRequest
            {
                RuleNames = new List<string> { "Maximum Individual Cover" },
                Data = context.Serialize(newCase),
                ExecutionFilter = "funeral"
            };
            var ruleRequestResults = await context.ExecuteRules(ruleRequest);
            list.AddRange(ruleRequestResults.RuleResults);
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, Case newCase)
        {
            var list = new List<RuleResult>();
            list.AddRange(await CheckBenefitRules(context, newCase.MainMember));
            list.AddRange(await CheckBenefitRules(context, newCase.Spouse));
            list.AddRange(await CheckBenefitRules(context, newCase.Children));
            list.AddRange(await CheckBenefitRules(context, newCase.ExtendedFamily));
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, List<RolePlayer> members)
        {
            var list = new List<RuleResult>();
            if (members != null)
            {
                foreach (var member in members)
                {
                    list.AddRange(await CheckBenefitRules(context, member));
                }
            }
            return list;
        }

        private async Task<List<RuleResult>> CheckBenefitRules(IWizardContext context, RolePlayer member)
        {
            var list = new List<RuleResult>();
            var rulesRelaxDate = DateTime.Parse(await _configurationService.GetModuleSetting("OnboardingRulesRelax"));
            if (member != null && member.Person != null)
            {
                if (member.Benefits != null && member.Benefits.Count > 0)
                {
                    foreach (var memberBenefit in member.Benefits)
                    {
                        var benefit = await _benefitService.GetBenefit(memberBenefit.Id);
                        if (benefit == null)
                            return new List<RuleResult>() { GetRuleResult(false, $"Invalid benefit has been selected for {member.DisplayName}") };

                        var executeRules = benefit.RuleItems.ToList();
                        if (member.JoinDate < rulesRelaxDate)
                        {
                            executeRules = executeRules.Where(s => !ageRules.Contains(s.RuleId)).ToList();
                        }

                        var ruleIds = executeRules.Select(ri => ri.RuleId).ToList();
                        var ruleRequest = new RuleRequest
                        {
                            RuleIds = ruleIds,
                            RuleItems = executeRules,
                            Data = context.Serialize(member),
                            ExecutionFilter = "benefit"
                        };
                        var ruleRequestResults = await context.ExecuteRules(ruleRequest);
                        list.AddRange(ruleRequestResults.RuleResults);
                    }
                }
            }
            return list;
        }

        private async Task<List<RuleResult>> CheckProductOptionRules(IWizardContext context, Case newCase)
        {
            var list = new List<RuleResult>();
            foreach (var policyOwner in newCase.MainMember.Policies)
            {
                if (policyOwner.ProductOption != null)
                {
                    if (policyOwner.ProductOptionId > 0)
                    {
                        var productOption = await _productOptionService.GetProductOption(policyOwner.ProductOptionId);
                        if (productOption == null) return new List<RuleResult>() { GetRuleResult(false, "Invalid product option has been selected") };
                        var ruleRequest = new RuleRequest
                        {
                            RuleIds = productOption.RuleItems.Select(ri => ri.RuleId).ToList<int>(),
                            RuleItems = productOption.RuleItems,
                            Data = context.Serialize(newCase),
                            ExecutionFilter = "productOption"
                        };
                        var ruleRequestResults = await context.ExecuteRules(ruleRequest);
                        list.AddRange(ruleRequestResults.RuleResults);
                    }
                }
                else
                {
                    list.Add(GetRuleResult(false, "Main member product option has not been selected."));
                }
            }
            return list;
        }

        private async Task<List<RuleResult>> CheckProductRules(IWizardContext context, Case newCase)
        {
            var product = await _productService.GetProduct(newCase.ProductId);
            if (product == null) return new List<RuleResult>() { GetRuleResult(false, "Invalid product has been selected") };
            var ruleRequest = new RuleRequest
            {
                RuleIds = product.RuleItems.Select(ri => ri.RuleId).ToList<int>(),
                RuleItems = product.RuleItems,
                Data = context.Serialize(newCase),
                ExecutionFilter = "product"
            };
            var ruleRequestResults = await context.ExecuteRules(ruleRequest);
            return ruleRequestResults.RuleResults;
        }

        private Task<List<RuleResult>> CheckRoleplayersForMultipleRelationsRule(Case newCase)
        {
            var messages = new List<string>();
            var roleplayerRelations = new Dictionary<string, string>();

            // Add main member
            roleplayerRelations.Add(PersonHelper.GetIdOrPassport(newCase.MainMember.Person), newCase.MainMember.DisplayName);

            // Add spouse
            foreach (var spouse in newCase.Spouse)
            {
                if (!spouse.IsDeleted)
                {
                    if (roleplayerRelations.ContainsKey(PersonHelper.GetIdOrPassport(spouse.Person)))
                    {
                        messages.Add($"Spouse {spouse.DisplayName}: Identity number ({PersonHelper.GetIdOrPassport(spouse.Person)}) has been used by several roleplayers");
                    }
                    else
                    {
                        roleplayerRelations.Add(PersonHelper.GetIdOrPassport(spouse.Person), spouse.DisplayName);
                    }
                }
            }

            // Add childern
            foreach (var child in newCase.Children)
            {
                if (!child.IsDeleted)
                {
                    if (roleplayerRelations.ContainsKey(PersonHelper.GetIdOrPassport(child.Person)))
                    {
                        messages.Add($"Child {child.DisplayName}: Identity number ({PersonHelper.GetIdOrPassport(child.Person)}) has been used by several roleplayers");
                    }
                    else
                    {
                        roleplayerRelations.Add(PersonHelper.GetIdOrPassport(child.Person), child.DisplayName);
                    }
                }
            }

            // Add extended family members
            foreach (var relation in newCase.ExtendedFamily)
            {
                if (!relation.IsDeleted)
                {
                    if (roleplayerRelations.ContainsKey(PersonHelper.GetIdOrPassport(relation.Person)))
                    {
                        messages.Add($"Family member {relation.DisplayName}: Identity number ({PersonHelper.GetIdOrPassport(relation.Person)}) has been used by several roleplayers");
                    }
                    else
                    {
                        roleplayerRelations.Add(PersonHelper.GetIdOrPassport(relation.Person), relation.DisplayName);
                    }
                }
            }

            var result = new RuleResult
            {
                Passed = messages.Count == 0,
                RuleName = "Multiple Relations",
                MessageList = messages
            };

            return Task.FromResult(new List<RuleResult> { result });
        }

        private RuleResult GetRuleResult(bool success, string message)
        {
            return new RuleResult
            {
                Passed = success,
                RuleName = "Manage Individual Business",
                MessageList = new List<string>() { message }
            };
        }

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $"Update Individual Case {@case.Code} was Rejected");
                }
            }
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            Contract.Requires(context != null);
            if (rejectWizardRequest != null)
            {
                var wizard = context.Deserialize<Wizard>(context.Data);
                var stepData = context.Deserialize<ArrayList>(wizard.Data);
                var @case = context.Deserialize<Case>(stepData[0].ToString());

                var memberPortalBroker = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleBroker);
                var isBrokerOnPortal = await _userService.GetUsersByRoleAndEmail(memberPortalBroker, wizard.CreatedBy);
                if (isBrokerOnPortal != null)
                {
                    await SendNotification(wizard, rejectWizardRequest, $": Update Individual Case {@case.Code} was Disputed");

                    wizard.LockedToUser = wizard.CreatedBy;
                    wizard.WizardStatus = WizardStatusEnum.Disputed;
                    wizard.WizardStatusId = (int)WizardStatusEnum.Disputed;
                    await _wizardService.UpdateWizard(wizard);
                }
            }
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        private async Task SendNotification(Wizard wizard, RejectWizardRequest rejectWizardRequest, string title)
        {
            await _wizardService.SendWizardNotification("member-portal-notification", title,
                rejectWizardRequest.Comment, null, 0, wizard.ModifiedBy);
        }

        public Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
