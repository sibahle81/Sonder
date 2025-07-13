using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Cost;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using Benefit = RMA.Service.ClientCare.Contracts.Entities.Product.Benefit;
using RuleRequest = RMA.Service.Admin.RulesManager.Contracts.Entities.RuleRequest;

namespace RMA.Service.ClaimCare.Services.Cost
{
    public class CostFacade : RemotingStatelessService, ICostService
    {
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";
        private const string ChildCoverFeature = "ChildCoverFeature";

        private readonly IPolicyService _policyService;
        private readonly ISerializerService _serializer;
        private readonly IRuleEngineService _rulesEngine;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ITransactionService _transactionService;
        private readonly IProductOptionService _productOptionService;
        private readonly IConfigurationService _configurationService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        // Repositories
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_ClaimInvoice> _claimInvoiceRepository;
        public CostFacade(
              IPolicyService policyService
            , ISerializerService serializer
            , IRuleEngineService rulesEngine
            , StatelessServiceContext context
            , IRolePlayerService rolePlayerService
            , IConfigurationService configurationService
            , IProductOptionService productOptionService
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Claim> claimRepository
            , IRepository<claim_ClaimInvoice> claimInvoiceRepository
              , ITransactionService transactionService
              , IRepository<claim_PersonEvent> personEventRepository)
            : base(context)
        {
            _rulesEngine = rulesEngine;
            _dbContextScopeFactory = dbContextScopeFactory;
            _serializer = serializer;
            _claimRepository = claimRepository;
            _configurationService = configurationService;
            _claimInvoiceRepository = claimInvoiceRepository;
            _transactionService = transactionService;
            _personEventRepository = personEventRepository;
            _rolePlayerService = rolePlayerService;
            _policyService = policyService;
            _productOptionService = productOptionService;
        }

        public async Task<ClaimsCalculatedAmount> CalculateBeneficiaryPayment(int claimId, int beneficiaryId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                //Getting all the necessary Beneficiary, claim and coverAmount information 
                var childOlderThanSection55 = false;

                var beneficiary = await _rolePlayerService.GetPerson(beneficiaryId);

                var claimResult = (await _claimRepository.SingleOrDefaultAsync(s => s.ClaimId == claimId));
                var claim = AutoMapper.Mapper.Map<Contracts.Entities.Claim>(claimResult);

                var personEvent = await _personEventRepository.SingleOrDefaultAsync(p => p.PersonEventId == claim.PersonEventId);
                await _personEventRepository.LoadAsync(personEvent, a => a.PersonEventDeathDetail);

                var insuredLife = await _rolePlayerService.GetPerson(personEvent.InsuredLifeId);

                var calculatedAmounts = new ClaimsCalculatedAmount();
                if (claim == null) return calculatedAmounts;
                {
                    var policy = await _policyService.GetPolicy(claim.PolicyId.Value);
                    var productOptionId = policy.ProductOptionId;

                    var productClassId = (await _productOptionService.GetProductOption(productOptionId)).Product.ProductClassId;

                    var benefits = await _productOptionService.GetBenefitsForOption(productOptionId);
                    var deceasedRelationToMainMember = await _rolePlayerService.GetDeceasedRelationToMainMember(claim.PolicyId.Value, personEvent.InsuredLifeId);

                    decimal rmaCoverAmount = 0;
                    switch (productClassId) // have to get the product type here
                    {
                        //Fatal
                        case (int)ProductClassEnum.Assistance:
                        case (int)ProductClassEnum.Life:
                            CoverMemberTypeEnum coverMemberType;
                            switch (deceasedRelationToMainMember.RolePlayerTypeId)
                            {
                                case (int)RolePlayerTypeEnum.MainMemberSelf:
                                case (int)RolePlayerTypeEnum.Beneficiary:
                                    if (deceasedRelationToMainMember.FromRolePlayerId == deceasedRelationToMainMember.ToRolePlayerId)
                                    {
                                        rmaCoverAmount = await GetBenefitAmountByCoverType(benefits, CoverMemberTypeEnum.MainMember, rmaCoverAmount, insuredLife, claim.PolicyId.Value);
                                        coverMemberType = CoverMemberTypeEnum.MainMember;
                                    }
                                    else
                                    {
                                        rmaCoverAmount = await GetBenefitAmountByCoverType(benefits, CoverMemberTypeEnum.ExtendedFamily, rmaCoverAmount, insuredLife, claim.PolicyId.Value);
                                        coverMemberType = CoverMemberTypeEnum.ExtendedFamily;
                                    }
                                    break;
                                case (int)RolePlayerTypeEnum.Child:
                                case (int)RolePlayerTypeEnum.Daughter:
                                case (int)RolePlayerTypeEnum.Son:
                                    rmaCoverAmount = await GetBenefitAmountByCoverType(benefits, CoverMemberTypeEnum.Child, rmaCoverAmount, insuredLife, claim.PolicyId.Value);
                                    coverMemberType = CoverMemberTypeEnum.Child;
                                    break;
                                case (int)RolePlayerTypeEnum.Spouse:
                                case (int)RolePlayerTypeEnum.Wife:
                                case (int)RolePlayerTypeEnum.Husband:
                                    rmaCoverAmount = await GetBenefitAmountByCoverType(benefits, CoverMemberTypeEnum.Spouse, rmaCoverAmount, insuredLife, claim.PolicyId.Value);
                                    coverMemberType = CoverMemberTypeEnum.Spouse;
                                    break;
                                default:
                                    rmaCoverAmount = await GetBenefitAmountByCoverType(benefits, CoverMemberTypeEnum.ExtendedFamily, rmaCoverAmount, insuredLife, claim.PolicyId.Value);
                                    coverMemberType = CoverMemberTypeEnum.ExtendedFamily;
                                    break;
                            }

                            // The Rma amount the beneficiary is covered for, this is passed in to totalCover amount to check rules
                            beneficiary.TotalCoverAmount = Convert.ToDecimal(rmaCoverAmount);

                            //Creating Rule Object
                            var ruleRequest = new RuleRequest()
                            {
                                Data = _serializer.Serialize(beneficiary),
                                RuleNames = new List<string>() { "Child Cap Cover" },
                                ExecutionFilter = "Fatal",
                            };

                            // Checking the rules
                            var ruleResult = await _rulesEngine.ExecuteRules(ruleRequest);

                            // Getting all policies with insured life to get total payments authorized across all policies
                            var totalPaymentsAuthorized = await GetTotalPaymentsAuthorized(claim.PersonEventId);

                            // If rules succeed and beneficiary is an adult
                            if (ruleResult.OverallSuccess && deceasedRelationToMainMember.RolePlayerTypeId != (int)RolePlayerTypeEnum.Child)
                            {
                                var adultMaxCapValue = await _configurationService.GetModuleSetting(SystemSettings.MaximumCap21Up); //100 000
                                var remainingCapOverAll = GetRemainingCap(adultMaxCapValue, totalPaymentsAuthorized);
                                await CalculatingAmountToPay(remainingCapOverAll, rmaCoverAmount, calculatedAmounts, claim.PolicyId.Value, adultMaxCapValue, ruleResult, childOlderThanSection55, coverMemberType);

                            } // If its a child
                            else if (deceasedRelationToMainMember.RolePlayerTypeId == (int)RolePlayerTypeEnum.Child)
                            {
                                var section55MaxCapValue = "";
                                decimal? remainingCapOverAll = 0m;

                                if (await _configurationService.IsFeatureFlagSettingEnabled(ChildCoverFeature))
                                {
                                    var age = GetAge(insuredLife.Person.DateOfBirth, personEvent.PersonEventDeathDetail.DeathDate);

                                    var childCover = await _policyService.GetChildCover(age);
                                    section55MaxCapValue = childCover.MaxCapCover.ToString();

                                    var statedBenefitId = policy.PolicyInsuredLives.FirstOrDefault(pil => pil.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf)?.StatedBenefitId;
                                    var benefit = await _productOptionService.GetBenefitRate((int)statedBenefitId);
                                    if (benefit != null)
                                        rmaCoverAmount = benefit.BenefitAmount * childCover.CoverPercentage;

                                    remainingCapOverAll = GetRemainingCap(section55MaxCapValue, totalPaymentsAuthorized);
                                }
                                else
                                {
                                    var age = GetAge(insuredLife.Person.DateOfBirth);
                                    if (age < 1)
                                    {
                                        section55MaxCapValue = await _configurationService.GetModuleSetting(SystemSettings.Section55MaxCap05); //R20 000
                                        remainingCapOverAll = GetRemainingCap(section55MaxCapValue, totalPaymentsAuthorized);
                                    }
                                    if (age > 0 && age <= 5)
                                    {
                                        section55MaxCapValue = await _configurationService.GetModuleSetting(SystemSettings.Section55MaxCap05); //R20 000
                                        remainingCapOverAll = GetRemainingCap(section55MaxCapValue, totalPaymentsAuthorized);
                                    }
                                    else if (age >= 6 && age <= 13)
                                    {
                                        section55MaxCapValue = await _configurationService.GetModuleSetting(SystemSettings.Section55MaxCap613); //R50 000
                                        remainingCapOverAll = GetRemainingCap(section55MaxCapValue, totalPaymentsAuthorized);
                                    }
                                    else if (age >= 14 && age < 21)
                                    {
                                        section55MaxCapValue = await _configurationService.GetModuleSetting(SystemSettings.Section55MaxCap14up); //R104 000
                                        remainingCapOverAll = GetRemainingCap(section55MaxCapValue, totalPaymentsAuthorized);
                                    }
                                    else if (age >= 21 && !insuredLife.Person.IsStudying || age >= 21 && !insuredLife.Person.IsDisabled)
                                    {
                                        section55MaxCapValue = "0";
                                        remainingCapOverAll = 0M;
                                        childOlderThanSection55 = true;
                                    }
                                }
                                await CalculatingAmountToPay(remainingCapOverAll, rmaCoverAmount, calculatedAmounts, Convert.ToInt32(claim.PolicyId), section55MaxCapValue, ruleResult, childOlderThanSection55, coverMemberType);
                            }
                            break;
                        case (int)ProductClassEnum.Statutory:
                            break;
                    }
                }
                return calculatedAmounts;
            }
        }

        private async Task<decimal> GetBenefitAmountByCoverType(IEnumerable<Benefit> benefits, CoverMemberTypeEnum coverType, decimal rmaCoverAmount, RolePlayer insuredLife, int policyId)
        {
            var policy = await _policyService.GetPolicy(policyId);
            if (policy.PolicyLifeExtension != null)
            {
                var policyInsuredLife = await _policyService.GetPolicyInsuredLife(policyId, insuredLife.RolePlayerId);
                rmaCoverAmount = policyInsuredLife.CoverAmount == null ? 0M : (decimal)policyInsuredLife.CoverAmount;
            }
            else
            {
                var benefitId = insuredLife.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person ? Convert.ToInt32((await _policyService.GetPolicyInsuredLife(policyId, insuredLife.RolePlayerId)).StatedBenefitId) : 0;

                var benefit = benefitId > 0 ? benefits.FirstOrDefault(a => a.Id == benefitId) : await GetIndividualBenefit(benefits, coverType, insuredLife);

                rmaCoverAmount += benefit?.BenefitRates.Select(a => a.BenefitAmount).FirstOrDefault() ?? 0M;
            }

            return rmaCoverAmount;
        }

        private async Task<Benefit> GetIndividualBenefit(IEnumerable<Benefit> benefits, CoverMemberTypeEnum coverType, RolePlayer insuredLife)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            var benefit = new Benefit();
            if (coverType == CoverMemberTypeEnum.Child)
            {
                var age = GetAge(insuredLife.Person.DateOfBirth);
                if (age < 1)
                {
                    var query = await _configurationService.GetModuleSetting(SystemSettings.UnderOne);
                    benefit = GetCorrectBenefitRule(benefits, query);
                }
                if (age > 0 && age <= 5)
                {
                    var query = await _configurationService.GetModuleSetting(SystemSettings.ChildRuleUnder5);
                    benefit = GetCorrectBenefitRule(benefits, query);
                }
                else if (age >= 6 && age <= 13)
                {
                    var query = await _configurationService.GetModuleSetting(SystemSettings.ChildRuleUnder13);
                    benefit = GetCorrectBenefitRule(benefits, query);
                }
                else if (age >= 14 && age < 21)
                {
                    var query = await _configurationService.GetModuleSetting(SystemSettings.ChildRuleUnder21);
                    benefit = GetCorrectBenefitRule(benefits, query);
                }
                else if (age > 21 && age <= 24 && !insuredLife.Person.IsStudying)
                {
                    var query = await _configurationService.GetModuleSetting(SystemSettings.ChildRuleStudying24);
                    benefit = GetCorrectBenefitRule(benefits, query);
                }
                else if (age > 21 && age <= 200 && insuredLife.Person.IsDisabled)
                {
                    var query = await _configurationService.GetModuleSetting(SystemSettings.ChildRuleDisabled200);
                    benefit = GetCorrectBenefitRule(benefits, query);
                }
                else if (age > 21 && !insuredLife.Person.IsStudying && age > 21 && !insuredLife.Person.IsDisabled)
                {
                    benefit = null;
                }
            }
            else
            {
                benefit = benefits.FirstOrDefault(a => a.CoverMemberType == coverType);
            }

            return benefit;
        }

        private static Benefit GetCorrectBenefitRule(IEnumerable<Benefit> benefits, string query)
        {
            var benefit = new Benefit();
            query = query.Replace("\"", "\'");

            foreach (var item in benefits)
            {
                item.RuleItems.ForEach(result =>
                {
                    if (result.RuleConfiguration == null) return;
                    if (result.RuleConfiguration.Contains(query))
                    {
                        benefit = item;
                    }
                });
            }
            if (benefit.Id <= 0) benefit = null;
            return benefit;
        }

        private async Task CalculatingAmountToPay(decimal? remainingCapOverAll, decimal? rmaCoverAmount, ClaimsCalculatedAmount claimInvoice, int policyId, string section55MaxCapValue
            , RuleRequestResult ruleResult, bool childOlderThanSection55, CoverMemberTypeEnum coverMemberType)
        {
            var policy = await _policyService.GetPolicyWithoutReferenceData(policyId);

            if (childOlderThanSection55)
            {
                await PopulateClaimInvoiceFields(policy.PolicyOwnerId, 0M, claimInvoice, 0M);
                claimInvoice.ValidationReason = $"Child older than 21, not Disabled or Studying. No cover amount";
            }
            if (rmaCoverAmount <= 0 && !childOlderThanSection55)
            {
                await PopulateClaimInvoiceFields(policy.PolicyOwnerId, 0M, claimInvoice, 0M);
                claimInvoice.ValidationReason = $"There is no benefit for this {coverMemberType} ";
            }
            else
            {
                var leftOverCap = rmaCoverAmount > remainingCapOverAll ? rmaCoverAmount - (rmaCoverAmount - remainingCapOverAll) : remainingCapOverAll;

                var policyBalance = await GetPolicyBalance(policyId, false);
                claimInvoice.CapAmount = Convert.ToDecimal(section55MaxCapValue);
                claimInvoice.CoverAmount = Convert.ToDecimal(rmaCoverAmount);


                if (ruleResult.OverallSuccess)
                {
                    if (remainingCapOverAll >= rmaCoverAmount)
                    {
                        await PopulateClaimInvoiceFields(policy.PolicyOwnerId, policyBalance, claimInvoice, rmaCoverAmount);
                    }
                    else
                    {
                        await PopulateClaimInvoiceFields(policy.PolicyOwnerId, policyBalance, claimInvoice, leftOverCap);
                        claimInvoice.ValidationReason = $"Maximum cap cover of R{section55MaxCapValue} has been exceeded. remaining cover of {leftOverCap} will be paid ";
                    }
                }
                else
                {
                    foreach (var item in ruleResult.RuleResults)
                    {
                        foreach (var message in item.MessageList)
                        {
                            if (message.Contains("covered more than the maximum amount"))
                            {
                                claimInvoice.ValidationReason += message + " ";
                            }
                        }
                    }
                    await PopulateClaimInvoiceFields(policy.PolicyOwnerId, policyBalance, claimInvoice, Convert.ToDecimal(leftOverCap));
                }
            }
        }

        private static decimal? GetRemainingCap(string section55MaxCapValue, decimal? totalPaymentsAuthorized)
        {
            //Remaining cap across all policies
            return Convert.ToInt32(section55MaxCapValue) - totalPaymentsAuthorized;
        }

        private async Task<decimal?> GetTotalPaymentsAuthorized(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                //Total payments that have been authorized
                return (await (from clm in _claimRepository
                               join claimInvoice in _claimInvoiceRepository on clm.ClaimId equals claimInvoice.ClaimId
                               where claimInvoice.ClaimInvoiceDecision == ClaimInvoiceDecisionEnum.Authorise && clm.PersonEventId == personEventId
                               select claimInvoice.AuthorisedAmount)
                               .ToListAsync())
                               .Sum();
            }
        }

        private async Task PopulateClaimInvoiceFields(int rolePlayerId, decimal policyBalance, ClaimsCalculatedAmount claimsCalculatedAmount, decimal? totalAmount)
        {
            var debtorNetBalance = Math.Abs(await _transactionService.GetDebtorNetBalance(rolePlayerId));

            if (policyBalance > 0)
            {
                claimsCalculatedAmount.OutstandingPremiumAmount = policyBalance;
                claimsCalculatedAmount.RefundAmount = 0;
            }
            else
            {
                claimsCalculatedAmount.OutstandingPremiumAmount = 0;
                claimsCalculatedAmount.RefundAmount = debtorNetBalance;
            }
            claimsCalculatedAmount.TotalAmount = Convert.ToDecimal(totalAmount - Math.Abs(claimsCalculatedAmount.OutstandingPremiumAmount) + claimsCalculatedAmount.RefundAmount);
        }

        private async Task<decimal> GetPolicyBalance(int policyId, bool premiumWaived)
        {
            if (premiumWaived)
                return 0;

            return await _transactionService.GetPolicyPremiumBalance(policyId);
        }

        private static int GetAge(DateTime dateOfBirth)
        {
            var age = (int.Parse(DateTime.Today.ToString("yyyyMMdd")) - int.Parse(dateOfBirth.ToString("yyyyMMdd"))) / 10000;
            if (dateOfBirth > DateTime.Today.AddYears(-age))
                age--;

            return age;
        }

        private static int GetAge(DateTime dateOfBirth, DateTime dateOfDeath)
        {
            var age = (int.Parse(dateOfDeath.ToString("yyyyMMdd")) - int.Parse(dateOfBirth.ToString("yyyyMMdd"))) / 10000;
            if (dateOfBirth > dateOfDeath.AddYears(-age))
                age--;

            return age;
        }
    }
}