using AutoMapper;
using Microsoft.Extensions.Logging;
using RMA.Common.Database.ContextScope;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Contracts.Utils;
using RMA.Service.ClientCare.Database.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using Period = RMA.Service.Admin.MasterDataManager.Contracts.Entities.Period;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class BillingFuneralPolicyChangeFacade : RemotingStatelessService, IBillingFuneralPolicyChangeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IInvoiceService _invoiceService;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly ITransactionService _transactionService;
        private readonly IPolicyService _policyService;
        private readonly IPeriodService _periodService;
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyIntegrationService _policyIntegrationService;
        private const string BillingAdjustmentsFeatureFlag = "BillingAdjustmentsFeatureFlag";

        public BillingFuneralPolicyChangeFacade(
            IDbContextScopeFactory dbContextScopeFactory,
            IRolePlayerPolicyService rolePlayerPolicyService,
            StatelessServiceContext context,
            IInvoiceService invoiceService,
            IPolicyService policyService,
            ITransactionCreatorService transactionCreatorService,
            IPeriodService periodService,
            ITransactionService transactionService,
            IPolicyIntegrationService policyIntegrationService,
            IConfigurationService configurationService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _invoiceService = invoiceService;
            _policyService = policyService;
            _transactionCreatorService = transactionCreatorService;
            _periodService = periodService;
            _policyIntegrationService = policyIntegrationService;
            _transactionService = transactionService;
            _configurationService = configurationService;
        }

        public async Task CreateAdjustmentInvoice(InvoiceAdjustmentDetails invoiceAdjustmentDetails)
        {
            if (invoiceAdjustmentDetails != null)
            {
                var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicy(invoiceAdjustmentDetails.PolicyId);

                var policy = await _policyService.GetPolicyByPolicyId(invoiceAdjustmentDetails.PolicyId);

                int collectionDay = policy.FirstInstallmentDate.Day;

                var invoiceDate = invoiceAdjustmentDetails.TransactionDate;
                if (invoiceDate.Month == 12 && policy.DecemberInstallmentDayOfMonth.HasValue)
                    collectionDay = (int)policy?.DecemberInstallmentDayOfMonth;

                var invoiceAmount = invoiceAdjustmentDetails.Amount;

                if (invoiceAmount > 0)
                {
                    if (invoiceAdjustmentDetails.IsGroupPolicy)
                    {
                        var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(rolePlayerPolicy.PolicyId, invoiceDate);

                        if (originalPremiums.Count > 0)
                        {
                            _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, invoiceDate, invoiceAmount, invoiceAdjustmentDetails.Reason, InvoiceStatusEnum.Queued, invoiceAdjustmentDetails.SourceModule, invoiceAdjustmentDetails.sourceProcess, originalPremiums.FirstOrDefault());
                        }
                    }
                    else
                    {
                        _ = await _invoiceService.GeneratePartialInvoice(rolePlayerPolicy, invoiceDate, invoiceAmount, invoiceAdjustmentDetails.Reason, InvoiceStatusEnum.Queued, invoiceAdjustmentDetails.SourceModule, invoiceAdjustmentDetails.sourceProcess);
                    }
                }
            }
        }

        private async Task<List<Period>> GetAdjustmentPeriodsWithinDuration(DateTime effectiveDate)
        {
            List<Period> periodsForDuration = new List<Period>();
            var fromPeriod = await _periodService.GetPeriodByDate(effectiveDate);
            var toPeriod = await _periodService.GetPeriodByDate(DateTimeHelper.SaNow);

            if (toPeriod.StartDate >= fromPeriod.StartDate)
            {
                int numberOfPeriods = (toPeriod.Id - fromPeriod.Id) + 1;
                for (int i = 0; i < numberOfPeriods; i++)
                {
                    var period = await _periodService.GetPeriodById(fromPeriod.Id + i);
                    periodsForDuration.Add(period);
                }
            }

            return periodsForDuration;
        }

        private async Task CalculateInvoiceAdjustmentsForChildPoliciesPerPeriod(BillingPolicyChangeMessage policyChangesMessage, Dictionary<int, decimal> periodTotalInvoiceAdjustmentDictionary)
        {
            if (policyChangesMessage.NewPolicyDetails.ChildBillingPolicyChangeDetails == null
                || periodTotalInvoiceAdjustmentDictionary == null)
            {
                return;
            }
            if (policyChangesMessage != null)
            {
                foreach (var childBillingPolicyChangeDetail in policyChangesMessage.NewPolicyDetails.ChildBillingPolicyChangeDetails)
                {
                    var oldChildBillingPolicyChangeDetail = policyChangesMessage.OldPolicyDetails.ChildBillingPolicyChangeDetails.FirstOrDefault(x => x.PolicyId == childBillingPolicyChangeDetail.PolicyId);
                    var oldChildBillingPolicyChangeDetailInstallmentPremium = oldChildBillingPolicyChangeDetail == null ? 0 : oldChildBillingPolicyChangeDetail.InstallmentPremium;

                    decimal childPolicyAdjustmentAmount = childBillingPolicyChangeDetail.InstallmentPremium - oldChildBillingPolicyChangeDetailInstallmentPremium;

                    if (childBillingPolicyChangeDetail.EffectiveDate.HasValue)
                    {
                        var periodsWithinDuration = await GetAdjustmentPeriodsWithinDuration(childBillingPolicyChangeDetail.EffectiveDate.Value);

                        foreach (var period in periodsWithinDuration)
                        {
                            if (periodTotalInvoiceAdjustmentDictionary.TryGetValue(period.Id, out decimal totalAmount))
                            {
                                periodTotalInvoiceAdjustmentDictionary[period.Id] = totalAmount + childPolicyAdjustmentAmount;
                            }
                            else
                            {
                                periodTotalInvoiceAdjustmentDictionary.Add(period.Id, childPolicyAdjustmentAmount);
                            }
                        }
                    }
                }
            }
            return;
        }

        private async Task CalculateInvoiceAdjustmentsForExtendedFamilyInsuredLivesPerPeriod(BillingPolicyChangeMessage policyChangesMessage, Dictionary<int, decimal> periodTotalInvoiceAdjustmentDictionary)
        {

            if (policyChangesMessage.NewPolicyDetails.ExtendedFamilyPolicyInsuredLives == null
                || periodTotalInvoiceAdjustmentDictionary == null)
            {
                return;
            }

            var removedExtendedFamilyPolicyInsuredLivesJoin = (from oldExtendedFamilyPolicyInsuredLive in policyChangesMessage.OldPolicyDetails.ExtendedFamilyPolicyInsuredLives
                                                               join newExtendedFamilyPolicyInsuredLive in policyChangesMessage.NewPolicyDetails.ExtendedFamilyPolicyInsuredLives
                                                               on oldExtendedFamilyPolicyInsuredLive.RolePlayerId equals newExtendedFamilyPolicyInsuredLive.RolePlayerId
                                                               into OldNewExtendedFamilyPolicyInsuredLiveGroup
                                                               from recent in OldNewExtendedFamilyPolicyInsuredLiveGroup.DefaultIfEmpty()
                                                               select new { oldExtendedFamilyPolicyInsuredLive, recent }).ToList();

            foreach (var item in removedExtendedFamilyPolicyInsuredLivesJoin.Where(x => x.recent == null))
            {
                if (item.oldExtendedFamilyPolicyInsuredLive.EndDate.HasValue)
                {
                    var periodsWithinDuration = await GetAdjustmentPeriodsWithinDuration(item.oldExtendedFamilyPolicyInsuredLive.EndDate.Value);
                    decimal childPolicyAdjustmentAmount = item.oldExtendedFamilyPolicyInsuredLive.Premium ?? 0;

                    foreach (var period in periodsWithinDuration)
                    {
                        if (periodTotalInvoiceAdjustmentDictionary.TryGetValue(period.Id, out decimal totalAmount))
                        {
                            periodTotalInvoiceAdjustmentDictionary[period.Id] = totalAmount - Math.Abs(childPolicyAdjustmentAmount);
                        }
                        else
                        {
                            periodTotalInvoiceAdjustmentDictionary.Add(period.Id, -1 * Math.Abs(childPolicyAdjustmentAmount));
                        }
                    }
                }
            }

            var newExtendedFamilyPolicyInsuredLivesJoin = (from newExtendedFamilyPolicyInsuredLive in policyChangesMessage.NewPolicyDetails.ExtendedFamilyPolicyInsuredLives
                                                           join oldExtendedFamilyPolicyInsuredLive in policyChangesMessage.OldPolicyDetails.ExtendedFamilyPolicyInsuredLives
                                                           on newExtendedFamilyPolicyInsuredLive.RolePlayerId equals oldExtendedFamilyPolicyInsuredLive.RolePlayerId
                                                           into NewOldExtendedFamilyPolicyInsuredLiveGroup
                                                           from stale in NewOldExtendedFamilyPolicyInsuredLiveGroup.DefaultIfEmpty()
                                                           select new { newExtendedFamilyPolicyInsuredLive, stale }).ToList();

            foreach (var item in newExtendedFamilyPolicyInsuredLivesJoin.Where(x => x.stale == null))
            {
                var periodsWithinDuration = await GetAdjustmentPeriodsWithinDuration(item.newExtendedFamilyPolicyInsuredLive.StartDate.Value);
                decimal childPolicyAdjustmentAmount = item.newExtendedFamilyPolicyInsuredLive.Premium ?? 0;

                foreach (var period in periodsWithinDuration)
                {
                    if (periodTotalInvoiceAdjustmentDictionary.TryGetValue(period.Id, out decimal totalAmount))
                    {
                        periodTotalInvoiceAdjustmentDictionary[period.Id] = totalAmount + childPolicyAdjustmentAmount;
                    }
                    else
                    {
                        periodTotalInvoiceAdjustmentDictionary.Add(period.Id, childPolicyAdjustmentAmount);
                    }
                }
            }
        }

        public async Task ProcessBillingPolicyChanges(BillingPolicyChangeMessage policyChangesMessage)
        {
            try
            {
                if (!await _configurationService.IsFeatureFlagSettingEnabled(BillingAdjustmentsFeatureFlag))
                    return;

                List<Period> periodsForDurationOnParentPolicy = new List<Period>();
                Dictionary<int, decimal> periodTotalInvoiceAdjustmentDictionary = new Dictionary<int, decimal>();

                if (policyChangesMessage == null) return;

                if (policyChangesMessage.NewPolicyDetails.EffectiveDate.HasValue)
                {
                    periodsForDurationOnParentPolicy = await GetAdjustmentPeriodsWithinDuration(policyChangesMessage.NewPolicyDetails.EffectiveDate.Value);
                }

                await CalculateInvoiceAdjustmentsForChildPoliciesPerPeriod(policyChangesMessage, periodTotalInvoiceAdjustmentDictionary);
                await CalculateInvoiceAdjustmentsForExtendedFamilyInsuredLivesPerPeriod(policyChangesMessage, periodTotalInvoiceAdjustmentDictionary);

                var isGroupPolicy = policyChangesMessage.IsGroupPolicy;
                var existingPolicyDetail = policyChangesMessage.OldPolicyDetails;
                var updatedPolicyDetails = policyChangesMessage.NewPolicyDetails;
                RolePlayerPolicy rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(updatedPolicyDetails.PolicyId);

                if (!DateTime.TryParse(await _configurationService.GetModuleSetting("GroupRoundingCutoffDate"), out DateTime groupRoundingCutoffDate))
                {
                    groupRoundingCutoffDate = default;
                }

                var groupSchemePremiumRoundingExclusions = await _policyIntegrationService.GetGroupSchemePremiumRoundingExclusions();
                var allowRoundOff = !groupSchemePremiumRoundingExclusions.Exists(x => x.PolicyId == policyChangesMessage.OldPolicyDetails.PolicyId);

                if (!policyChangesMessage.IsGroupPolicy && rolePlayerPolicy.ParentPolicyId.HasValue)
                {
                    // get Parent RolePlayerPolicy
                    rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(rolePlayerPolicy.ParentPolicyId.Value);
                }

                int collectionDay = existingPolicyDetail.FirstInstallmentDate.Day;

                if (updatedPolicyDetails.PolicyInceptionDate.Date < existingPolicyDetail.PolicyInceptionDate.Date)
                {
                    //we have moved inception date backwards 
                    //no credit notes when backdating
                    var startMonth = updatedPolicyDetails.PolicyInceptionDate.Month;
                    var endMonth = existingPolicyDetail.PolicyInceptionDate.Month;
                    var invoiceDate = updatedPolicyDetails.PolicyInceptionDate;

                    while (startMonth < endMonth)
                    {
                        if (isGroupPolicy)
                        {
                            if (invoiceDate.Month == 12 && updatedPolicyDetails.DecemberInstallmentDayOfMonth.HasValue)
                                collectionDay = (int)existingPolicyDetail?.DecemberInstallmentDayOfMonth;

                            var collectionDate = new DateTime(invoiceDate.Year, invoiceDate.Month, collectionDay);
                            _ = await _invoiceService.GenerateGroupInvoice(updatedPolicyDetails.PolicyId, collectionDate, invoiceDate, PolicyChangeMessageTypeEnum.InceptionDateChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                        }
                        else
                        {
                            _ = await _invoiceService.GenerateInvoiceByPolicyAndMonth(rolePlayerPolicy, invoiceDate, PolicyChangeMessageTypeEnum.InceptionDateChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                        }

                        invoiceDate = invoiceDate.AddMonths(1);
                        startMonth++;
                    }
                }

                if (updatedPolicyDetails.PolicyInceptionDate.Date > existingPolicyDetail.PolicyInceptionDate.Date)
                {
                    //credit note and possible refund when forward dating
                    await SettleInvoicesForInceptionDateForwardMovement(rolePlayerPolicy);
                    if (isGroupPolicy)
                    {
                        if (updatedPolicyDetails.PolicyInceptionDate.Month == 12 && updatedPolicyDetails.DecemberInstallmentDayOfMonth.HasValue)
                            collectionDay = (int)existingPolicyDetail?.DecemberInstallmentDayOfMonth;

                        var collectionDate = new DateTime(updatedPolicyDetails.PolicyInceptionDate.Year, updatedPolicyDetails.PolicyInceptionDate.Month, collectionDay);
                        _ = await _invoiceService.GenerateGroupInvoice(updatedPolicyDetails.PolicyId, collectionDate, updatedPolicyDetails.PolicyInceptionDate, PolicyChangeMessageTypeEnum.InceptionDateChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                    }
                    else
                    {
                        _ = await _invoiceService.GenerateInvoiceByPolicyAndMonth(rolePlayerPolicy, updatedPolicyDetails.PolicyInceptionDate, PolicyChangeMessageTypeEnum.InceptionDateChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                    }
                }

                if (policyChangesMessage.PolicyChangeMessageType == PolicyChangeMessageTypeEnum.MemberCountChange
                    && updatedPolicyDetails.PolicyInceptionDate.Date < existingPolicyDetail.PolicyInceptionDate.Date)
                {
                    var startMonth = updatedPolicyDetails.PolicyInceptionDate.Month;
                    var endMonth = existingPolicyDetail.PolicyInceptionDate.Month;
                    var invoiceDate = updatedPolicyDetails.PolicyInceptionDate;
                    decimal invoiceTotal = updatedPolicyDetails.InstallmentPremium - existingPolicyDetail.InstallmentPremium;

                    while (startMonth < endMonth)
                    {
                        if (invoiceTotal > 0)
                        {
                            var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(rolePlayerPolicy.PolicyId, invoiceDate);
                            
                            if (originalPremiums.Count > 0)
                            {
                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = invoiceTotal,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                invoiceTotal = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);
                                
                                _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, invoiceDate, invoiceTotal, PolicyChangeMessageTypeEnum.MemberCountChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance, originalPremiums.FirstOrDefault());
                            }
                        }

                        if (invoiceTotal < 0)
                        {
                            var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                            {
                                BaseRate = invoiceTotal,
                                AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                GroupRoundingCutoffDate = groupRoundingCutoffDate
                            };

                            policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                            var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy);

                            if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                            {
                                _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.MemberCountChange.GetDescription(), null, InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                            }
                        }

                        invoiceDate = invoiceDate.AddMonths(1);
                        startMonth++;
                    }
                }
                else if (policyChangesMessage.PolicyChangeMessageType == PolicyChangeMessageTypeEnum.MemberCountChange)
                {
                    decimal invoiceTotal = policyChangesMessage.AdjustmentAmount;

                    if (periodTotalInvoiceAdjustmentDictionary.Where(x => x.Value != 0).ToList().Count > 0)
                    {
                        foreach (var periodTotalInvoiceAdjustment in periodTotalInvoiceAdjustmentDictionary.Where(x => x.Value != 0))
                        {
                            var period = await _periodService.GetPeriodById(periodTotalInvoiceAdjustment.Key);

                            if (invoiceTotal > 0)
                            {
                                invoiceTotal = periodTotalInvoiceAdjustment.Value;

                                var invoiceDate = period.EndDate;
                                var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(rolePlayerPolicy.PolicyId, invoiceDate);

                                if (originalPremiums.Count > 0)
                                {
                                    var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                    {
                                        BaseRate = invoiceTotal,
                                        AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                        BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                        CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                        PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                        PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                        GroupRoundingCutoffDate = groupRoundingCutoffDate
                                    };

                                    invoiceTotal = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                    _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, invoiceDate, invoiceTotal, PolicyChangeMessageTypeEnum.MemberCountChange.GetDescription(), InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance, originalPremiums.FirstOrDefault());
                                }
                            }

                            if (invoiceTotal < 0)
                            {
                                invoiceTotal = periodTotalInvoiceAdjustment.Value;
                                policyChangesMessage.AdjustmentAmount = invoiceTotal;

                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = invoiceTotal,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy, period.StartDate);

                                if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                                {
                                    _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.MemberCountChange.GetDescription(), null, InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance);
                                }
                            }
                        }
                    }
                    else if (periodsForDurationOnParentPolicy.Count > 0)
                    {
                        var newestExtendedMember = updatedPolicyDetails.ExtendedFamilyPolicyInsuredLives
                            .Where(newMember => !existingPolicyDetail.ExtendedFamilyPolicyInsuredLives
                                .Any(existingMember => existingMember.RolePlayerId == newMember.RolePlayerId))
                            .ToList();

                        var removedMembers = existingPolicyDetail.ExtendedFamilyPolicyInsuredLives
                            .Where(existingMember => !updatedPolicyDetails.ExtendedFamilyPolicyInsuredLives
                                .Any(newMember => newMember.RolePlayerId == existingMember.RolePlayerId))
                            .ToList();

                        foreach (var period in periodsForDurationOnParentPolicy)
                        {
                            if (invoiceTotal > 0)
                            {
                                var policyId = existingPolicyDetail.ParentPolicyId.HasValue ? existingPolicyDetail.ParentPolicyId.Value : rolePlayerPolicy.PolicyId;
                                var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(policyId, period.EndDate);

                                newestExtendedMember.ForEach(od =>
                                {
                                    var matching = newestExtendedMember
                                        .FirstOrDefault(nd => nd.RolePlayerId == od.RolePlayerId);

                                    if (matching != null && matching.StartDate.HasValue
                                        && matching.StartDate.Value.Month == period.StartDate.Month
                                        && matching.StartDate.Value.Year == period.StartDate.Year)
                                    {
                                        policyChangesMessage.AdjustmentAmount += matching.Premium.Value;
                                    }
                                });

                                removedMembers.ForEach(od =>
                                {
                                    var matching = removedMembers
                                        .FirstOrDefault(nd => nd.RolePlayerId == od.RolePlayerId);

                                    if (matching != null && matching.StartDate.HasValue
                                        && matching.StartDate.Value.Month == period.StartDate.Month
                                        && matching.StartDate.Value.Year == period.StartDate.Year)
                                    {
                                        policyChangesMessage.AdjustmentAmount += matching.Premium.Value;
                                    }
                                });

                                if (originalPremiums.Count > 0)
                                {
                                    var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                    {
                                        BaseRate = policyChangesMessage.AdjustmentAmount,
                                        AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                        BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                        CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                        PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                        PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                        GroupRoundingCutoffDate = groupRoundingCutoffDate
                                    };

                                    policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                    _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, period.EndDate, policyChangesMessage.AdjustmentAmount, PolicyChangeMessageTypeEnum.MemberCountChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance, originalPremiums.FirstOrDefault());
                                }
                            }

                            if (invoiceTotal < 0)
                            {
                                var oldExtendedFamilyMembers = policyChangesMessage.OldPolicyDetails.ExtendedFamilyPolicyInsuredLives;
                                var newExtendedFamilyMembers = policyChangesMessage.NewPolicyDetails.ExtendedFamilyPolicyInsuredLives;

                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = policyChangesMessage.AdjustmentAmount,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy, period.StartDate);

                                if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                                {
                                    _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.MemberCountChange.GetDescription(), null, InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                                }
                            }
                        }
                    }
                    else
                    {
                        if (invoiceTotal > 0)
                        {
                            var invoiceDate = updatedPolicyDetails.PolicyInceptionDate;
                            var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(rolePlayerPolicy.PolicyId, invoiceDate);
                    
                            if (originalPremiums.Count > 0)
                            {
                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = invoiceTotal,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                invoiceTotal = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, invoiceDate, invoiceTotal, PolicyChangeMessageTypeEnum.MemberCountChange.GetDescription(), InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance, originalPremiums.FirstOrDefault());
                            }
                        }

                        if (invoiceTotal < 0)
                        {
                            var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                            {
                                BaseRate = invoiceTotal,
                                AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                GroupRoundingCutoffDate = groupRoundingCutoffDate
                            };

                            policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                            var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy);

                            if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                            {
                                _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.MemberCountChange.GetDescription(), null, InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                            }
                        }
                    }
                }

                if (policyChangesMessage.PolicyChangeMessageType == PolicyChangeMessageTypeEnum.AnnualPremiumIncrease)
                {
                    decimal invoiceTotal = updatedPolicyDetails.InstallmentPremium - existingPolicyDetail.InstallmentPremium;

                    if (periodTotalInvoiceAdjustmentDictionary.Count > 0)
                    {
                        foreach (var periodTotalInvoiceAdjustment in periodTotalInvoiceAdjustmentDictionary)
                        {
                            var period = await _periodService.GetPeriodById(periodTotalInvoiceAdjustment.Key);
                            if (invoiceTotal > 0)
                            {
                                invoiceTotal = periodTotalInvoiceAdjustment.Value;

                                var invoiceDate = period.EndDate;
                                var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(rolePlayerPolicy.PolicyId, invoiceDate);
                
                                if (originalPremiums.Count > 0)
                                {
                                    var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                    {
                                        BaseRate = invoiceTotal,
                                        AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                        BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                        CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                        PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                        PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                        GroupRoundingCutoffDate = groupRoundingCutoffDate
                                    };

                                    policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                    _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, invoiceDate, policyChangesMessage.AdjustmentAmount, PolicyChangeMessageTypeEnum.AnnualPremiumIncrease.GetDescription(), InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance, originalPremiums.FirstOrDefault());
                                }
                            }

                            if (invoiceTotal < 0)
                            {
                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = invoiceTotal,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy, period.StartDate);

                                if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                                {
                                    _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.Adjustment.GetDescription(), null, InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance);
                                }
                            }
                        }
                    }
                    else if (periodsForDurationOnParentPolicy.Count > 0)
                    {
                        foreach (var period in periodsForDurationOnParentPolicy)
                        {
                            if (invoiceTotal > 0)
                            {
                                var invoiceDate = period.EndDate;
                                var originalPremiums = await _invoiceService.GetPaidInvoicesByDateAndPolicyId(rolePlayerPolicy.PolicyId, invoiceDate);

                                if (originalPremiums.Count > 0)
                                {
                                    var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                    {
                                        BaseRate = invoiceTotal,
                                        AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                        BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                        CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                        PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                        PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                        GroupRoundingCutoffDate = groupRoundingCutoffDate
                                    };

                                    policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                    _ = await _invoiceService.GenerateGroupPartialInvoice(rolePlayerPolicy, invoiceDate, policyChangesMessage.AdjustmentAmount, PolicyChangeMessageTypeEnum.AnnualPremiumIncrease.GetDescription(), InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance, originalPremiums.FirstOrDefault());
                                }
                            }

                            if (invoiceTotal < 0)
                            {
                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = invoiceTotal,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy, period.StartDate);

                                if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                                {
                                    _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.Adjustment.GetDescription(), null, InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance);
                                }
                            }
                        }
                    }
                }

                if (policyChangesMessage.PolicyChangeMessageType == PolicyChangeMessageTypeEnum.PolicyCancelled)
                {
                    if (updatedPolicyDetails.EffectiveDate == null
                        && updatedPolicyDetails.ChildBillingPolicyChangeDetails.Count > 0)
                    {
                        var startDate = updatedPolicyDetails.ChildBillingPolicyChangeDetails.Min(x => x.EffectiveDate).Value;
                        var endPeriod = await _periodService.GetCurrentPeriod();
                        var endDate = endPeriod.EndDate.AddMonths(1); // we want to include current period's transactions
                        var totalCreditNoteAmount = 0M;
                        var startYearMonth = $"{startDate.Year}{startDate.Month.ToString().PadLeft(2, '0')}"; // format: YYYYMM
                        var endYearMonth = $"{endDate.Year}{endDate.Month.ToString().PadLeft(2, '0')}"; // format: YYYYMM

                        while (string.Compare(startYearMonth, endYearMonth, StringComparison.InvariantCulture) < 0)
                        {
                            totalCreditNoteAmount += updatedPolicyDetails.ChildBillingPolicyChangeDetails
                                .Where(x => x.EffectiveDate.Value.Month == startDate.Month && x.EffectiveDate.Value.Year == startDate.Year)
                                .Sum(p => p.InstallmentPremium);

                            if (totalCreditNoteAmount > 0)
                            {
                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = totalCreditNoteAmount,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                policyChangesMessage.NewPolicyDetails.InstallmentPremium = policyChangesMessage.OldPolicyDetails.InstallmentPremium - totalCreditNoteAmount;

                                var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy, startDate);
                            }

                            startDate = startDate.AddMonths(1);
                            startYearMonth = $"{startDate.Year}{startDate.Month.ToString().PadLeft(2, '0')}";
                        }
                    }
                    else
                    {
                        var startMonth = updatedPolicyDetails.PolicyInceptionDate.Month;
                        var endMonth = existingPolicyDetail.PolicyInceptionDate.Month;
                        var invoiceDate = updatedPolicyDetails.PolicyInceptionDate;
                        decimal invoiceTotal = updatedPolicyDetails.InstallmentPremium - existingPolicyDetail.InstallmentPremium;

                        while (startMonth < endMonth)
                        {
                            if (invoiceTotal < 0)
                            {
                                var funeralPolicyPremiumCalculation = new FuneralPolicyPremiumCalculation
                                {
                                    BaseRate = invoiceTotal,
                                    AdministrationPercentage = updatedPolicyDetails.AdministrationPercentage,
                                    BinderFeePercentage = updatedPolicyDetails.BinderFeePercentage,
                                    CommissionPercentage = updatedPolicyDetails.CommissionPercentage,
                                    PremiumAdjustmentPercentage = updatedPolicyDetails.PremiumAdjustmentPercentage,
                                    PolicyInceptionDate = isGroupPolicy ? updatedPolicyDetails.PolicyInceptionDate : default,
                                    GroupRoundingCutoffDate = groupRoundingCutoffDate
                                };

                                policyChangesMessage.AdjustmentAmount = PolicyPremiumCalculationHelper.CalculateFuneralPolicyPremium(funeralPolicyPremiumCalculation, allowRoundOff);

                                var updatePolicyPremiumMessage = await ProcessAdjustmentCreditNotes(policyChangesMessage, rolePlayerPolicy);

                                if (updatePolicyPremiumMessage.PolicyId == 0 || string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                                {
                                    _ = await _invoiceService.CreateCreditNoteForInvoice(rolePlayerPolicy.PolicyOwnerId, Math.Abs(policyChangesMessage.AdjustmentAmount), CreditNoteTypeEnum.MemberCountChange.GetDescription(), null, InvoiceStatusEnum.Queued, policyChangesMessage.SourceModule, SourceProcessEnum.Maintenance);
                                }
                            }

                            invoiceDate = invoiceDate.AddMonths(1);
                            startMonth++;
                        }
                    }
                }

                if (updatedPolicyDetails.PolicyStatus == PolicyStatusEnum.Cancelled)
                {
                    await _invoiceService.CreatePolicyCancellationInvoices(updatedPolicyDetails, rolePlayerPolicy, InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Cancellation);
                }

                _ = Task.Run(() => _invoiceService.AssignInvoiceNumbers());
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occurred processing billing policy changes for policy: {policyChangesMessage?.NewPolicyDetails.PolicyId}");
                throw;
            }
        }

        private async Task<UpdatePolicyPremiumMessage> ProcessAdjustmentCreditNotes(BillingPolicyChangeMessage policyChangesMessage, RolePlayerPolicy rolePlayerPolicy, DateTime? startDate = null)
        {
            var oldPolicy = policyChangesMessage.OldPolicyDetails;
            var newPolicy = policyChangesMessage.NewPolicyDetails;

            var updatePolicyPremiumMessage = new UpdatePolicyPremiumMessage()
            {
                PolicyId = oldPolicy.PolicyId
            };

            if (oldPolicy.InstallmentPremium <= newPolicy.InstallmentPremium)
            {
                return updatePolicyPremiumMessage;
            }

            var transactions = new List<Billing.Contracts.Entities.Transaction>();
            int? invoiceId = null;
            int? transactionId = null;

            if (!startDate.HasValue)
            {
                var period = await _periodService.GetCurrentPeriod();
                startDate = period.StartDate;
            }

            if (startDate.HasValue)
            {
                // HACK: This is just temporary as there's no way of assigning the correct date on the calling function
                // as the calling method is shared between adjustment credit notes and adjustment invoices
                // We now have an unnecessary loop that is a performance issue
                startDate = startDate.Value.AddMonths(1);

                var policyId = oldPolicy.PolicyId;

                if (rolePlayerPolicy != null)
                    policyId = rolePlayerPolicy.PolicyId;

                transactions = await _transactionService.GetTransactionsByDateAndPolicyId(policyId, startDate.Value);

                if (transactions != null && transactions.Count > 0)
                {
                    var transaction = transactions.FirstOrDefault(x => x.TransactionDate.Month == startDate.Value.Month
                                    && x.TransactionDate.Year == startDate.Value.Year);

                    invoiceId = transaction.InvoiceId;
                    transactionId = transaction.TransactionId;
                }
            }

            if (invoiceId.HasValue && transactionId.HasValue)
            {
                var existingTransactions = await _transactionService.GetInvoiceTransactions(invoiceId.Value);
                var adjustmentCreditNoteTransactions = existingTransactions
                            .Where(x => x.TransactionType == TransactionTypeEnum.CreditNote
                                    && x.TransactionReason == TransactionReasonEnum.PremiumAdjustment);

                await ReverseExistingAdjustmentCreditNotes(adjustmentCreditNoteTransactions);

                updatePolicyPremiumMessage = new UpdatePolicyPremiumMessage()
                {
                    PolicyId = newPolicy.ParentPolicyId.HasValue ? newPolicy.ParentPolicyId.Value : newPolicy.PolicyId,
                    InvoiceId = invoiceId,
                    TransactionId = transactionId,
                    PolicyNumber = rolePlayerPolicy.PolicyNumber,
                    RolePlayerId = rolePlayerPolicy.PolicyOwnerId,
                    OldPremiumAmount = oldPolicy.InstallmentPremium,
                    NewPremiumAmount = newPolicy.InstallmentPremium,
                    AdjustmentPremium = policyChangesMessage.AdjustmentAmount,
                    ImpersonateUser = RmaIdentity.Username,
                    MessageId = Guid.NewGuid().ToString(),
                    AdjustmentStartDate = startDate,
                    TransactionReason = $"{policyChangesMessage.TransactionReason} - {startDate.FormatIsoDate()}"
                };

                if (updatePolicyPremiumMessage.PolicyId > 0 && !string.IsNullOrWhiteSpace(updatePolicyPremiumMessage.MessageId))
                {
                    await _transactionCreatorService.CreateAdjustmentCreditNote(updatePolicyPremiumMessage);
                }
            }

            return updatePolicyPremiumMessage;
        }

        private async Task SettleInvoicesForInceptionDateForwardMovement(RolePlayerPolicy policy)
        {
            if (policy != null) {
            var claimsExistAgainstPolicy = await _rolePlayerPolicyService.CheckNoClaimsAgainstPolicy(policy.PolicyId);
                if (!claimsExistAgainstPolicy)
                {
                    var invoices = await _transactionCreatorService.GetPolicyInvoices(policy.PolicyId);
                    if (invoices.Count > 0)
                    {
                        foreach (var invoice in invoices)
                        {
                            await _invoiceService.CreateCreditNoteForInvoice(policy.PolicyPayeeId, invoice.TotalInvoiceAmount, CreditNoteTypeEnum.PolicyInceptionChanges.GetDescription(), invoice, InvoiceStatusEnum.Queued, SourceModuleEnum.ClientCare, SourceProcessEnum.Cancellation);
                        }
                    }
                }
            }
        }

        private async Task ReverseExistingAdjustmentCreditNotes(IEnumerable<Billing.Contracts.Entities.Transaction> adjustmentCreditNoteTransactions)
        {
            if (adjustmentCreditNoteTransactions.Any())
            {
                var transactions = new List<Billing.Contracts.Entities.Transaction>();
                foreach (var adjustmentCreditNoteTransaction in adjustmentCreditNoteTransactions)
                {
                    adjustmentCreditNoteTransaction.TransactionType = TransactionTypeEnum.CreditNoteReversal;
                    adjustmentCreditNoteTransaction.ModifiedBy = RmaIdentity.Username;

                    transactions.Add(Mapper.Map<Billing.Contracts.Entities.Transaction>(adjustmentCreditNoteTransaction));
                }

                await _transactionService.UpdateTransaction(transactions);
            }
        }
    }
}
