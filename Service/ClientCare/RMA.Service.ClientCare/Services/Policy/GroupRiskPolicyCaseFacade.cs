using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;
using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Utils;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;

using RolePlayerModel = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;
using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Services.Policy
{
    public enum ChangesOnBenefitCategory
    {
        None,
        Both,
        InsuredSumAssured,
        PersonInsuredCategory,
    }

    public class GroupRiskPolicyCaseFacade : RemotingStatelessService, IGroupRiskPolicyCaseService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IBrokerageService _brokerageService;
        private readonly IRepresentativeService _representativeService;
        private readonly IProductOptionService _productOptionService;
        private readonly IProductService _productService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<policy_PolicyBroker> _policyBrokerRepository;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<client_Reinsurer> _reinurerRepository;
        private readonly IRepository<policy_PolicyTreaty> _policyTreatyRepository;
        private readonly IRepository<policy_PolicyBinder> _policyBinderrRepository;
        private readonly IRepository<policy_PolicyDetail> _policyDetailRepository;
        private readonly IRepository<reinsurance_Treaty> _reinurerTreatyRepository;
        private readonly IRepository<policy_PolicyOption> _policyOptionRepository;
        private readonly IRepository<policy_PolicyBenefitDetail> _policyBenefitDetailRepository;
        private readonly IRepository<policy_PolicyBenefitOption> _policyBenefitOptionRepository;
        private readonly IRepository<policy_PolicyBenefitCategory> _policyBenefitCategoryRepository;
        private readonly IRepository<policy_BenefitCategoryExtension> _policyBenefitCategoryExtensionRepository;
        private readonly IRepository<product_BenefitOptionItemValue> _productBenefitOptionItemValueRepository;
        private readonly IRepository<policy_BenefitCategoryOption> _policyBenefitCategoryOptionRepository;
        private readonly IRepository<common_OptionItem> _optionItemRepository;
        private readonly IRepository<common_PremiumComponent> _premiumComponentRepository;
        private readonly IRepository<policy_BenefitRate> _policyBenefitRateRepository;
        private readonly IRepository<policy_BenefitRateDetail> _policyBenefitRateDetailRepository;
        private readonly IRepository<policy_BenefitRateSplit> _policyBenefitRateSplitRepository;
        private readonly IRepository<product_ProductOptionOptionItemValue> _productOptionItemValueRepository;
        private readonly IRepository<product_ProductOption> _productProductOptionRepository;
        private readonly IRepository<common_OptionType> _optionTypeRepository;
        private readonly IRepository<policy_BenefitPayroll> _benefitPayrollRepository;
        private readonly IInvoiceService _invoiceService;
        private readonly IRepository<policy_PersonInsuredCategory> _policyPersonInsuredCategoryRepository;
        private readonly IRepository<policy_InsuredSumAssured> _policyInsuredSumAssuredRepository;
        private readonly IRepository<client_RolePlayerRelation> _rolePlayerRelationRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<client_PersonEmployment> _personEmploymentRepository;
        private readonly IRepository<common_FuneralInsuredType> _funeralInsuredTypeRepository;
        private readonly IRepository<policy_BenefitCategoryFuneral> _BenefitCategoryFuneralRepository;

        private readonly string _clientReferencePrefix = "RMA";

        private readonly int _groupRiskDummyRepresentativeId = 0;
        private readonly List<string> _policyOptionOptionTypeCodes = new List<string> { GroupRiskPolicyCaseUtility.FirstYearBrokerComm, GroupRiskPolicyCaseUtility.RecurringBrokerComm, GroupRiskPolicyCaseUtility.ContractorCover, GroupRiskPolicyCaseUtility.PartialWaiverActiveAtWork, GroupRiskPolicyCaseUtility.PartialWaiverPreExisting, GroupRiskPolicyCaseUtility.BinderFee, GroupRiskPolicyCaseUtility.OutsourceFee };

        public GroupRiskPolicyCaseFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IDocumentGeneratorService documentGeneratorService,
            IBrokerageService brokerageService,
            IRepresentativeService representativeService,
            IProductOptionService productOptionService,
            IProductService productService,
            IRolePlayerService rolePlayerService,
            IInvoiceService invoiceService,
            IRepository<policy_PolicyBroker> policyBrokerRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<product_Benefit> benefitRepository,
            IRepository<client_Reinsurer> reinurerRepository,
            IRepository<policy_PolicyTreaty> policyTreatyRepository,
            IRepository<policy_PolicyBinder> policyBinderrRepository,
            IRepository<policy_PolicyDetail> policyDetailRepository,
            IRepository<reinsurance_Treaty> reinurerTreatyRepository,
            IRepository<policy_PolicyBenefitDetail> policyBenefitDetailRepository,
            IRepository<policy_PolicyBenefitOption> policyBenefitOptionRepository,
            IRepository<policy_PolicyOption> policyOptionRepository,
            IRepository<policy_PolicyBenefitCategory> policyBenefitCategoryRepository,
            IRepository<common_PremiumComponent> premiumComponentRepository,
            IRepository<policy_BenefitRate> policyBenefitRateRepository,
            IRepository<policy_BenefitRateDetail> policyBenefitRateDetailRepository,
            IRepository<policy_BenefitRateSplit> policyBenefitRateSplitRepository,
            IRepository<policy_BenefitCategoryExtension> policyBenefitCategoryExtensionRepository,
            IRepository<product_BenefitOptionItemValue> productBenefitOptionItemValueRepository,
            IRepository<common_OptionItem> optionItemRepository,
            IRepository<policy_BenefitCategoryOption> policyBenefitCategoryOptionRepository,
            IRepository<product_ProductOptionOptionItemValue> productOptionItemValueRepository,
            IRepository<product_ProductOption> productProductOptionRepository,
            IRepository<policy_PersonInsuredCategory> policyPersonInsuredCategoryRepository,
            IRepository<policy_InsuredSumAssured> policyInsuredSumAssuredRepository,
            IRepository<common_OptionType> optionTypeRepository,
            IRepository<policy_BenefitPayroll> benefitPayrollRepository,
            IRepository<client_RolePlayerRelation> rolePlayerRelationRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<client_Person> personRepository,
            IRepository<client_PersonEmployment> personEmploymentRepository,
            IRepository<common_FuneralInsuredType> funeralInsuredTypeRepository,
            IRepository<policy_BenefitCategoryFuneral> benefitCategoryFuneral) : base(context)

        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _documentGeneratorService = documentGeneratorService;
            _brokerageService = brokerageService;
            _representativeService = representativeService;
            _productOptionService = productOptionService;
            _rolePlayerService = rolePlayerService;
            _policyRepository = policyRepository;
            _policyBrokerRepository = policyBrokerRepository;
            _benefitRepository = benefitRepository;
            _reinurerRepository = reinurerRepository;
            _policyTreatyRepository = policyTreatyRepository;
            _policyBinderrRepository = policyBinderrRepository;
            _policyDetailRepository = policyDetailRepository;
            _reinurerTreatyRepository = reinurerTreatyRepository;
            _policyOptionRepository = policyOptionRepository;
            _policyBenefitDetailRepository = policyBenefitDetailRepository;
            _policyBenefitOptionRepository = policyBenefitOptionRepository;
            _productService = productService;
            _policyBenefitCategoryRepository = policyBenefitCategoryRepository;
            _policyBenefitCategoryExtensionRepository = policyBenefitCategoryExtensionRepository;
            _productBenefitOptionItemValueRepository = productBenefitOptionItemValueRepository;
            _policyBenefitCategoryOptionRepository = policyBenefitCategoryOptionRepository;
            _optionItemRepository = optionItemRepository;
            _premiumComponentRepository = premiumComponentRepository;
            _policyBenefitRateRepository = policyBenefitRateRepository;
            _policyBenefitRateDetailRepository = policyBenefitRateDetailRepository;
            _policyBenefitRateSplitRepository = policyBenefitRateSplitRepository;
            _productOptionItemValueRepository = productOptionItemValueRepository;
            _productProductOptionRepository = productProductOptionRepository;
            _optionTypeRepository = optionTypeRepository;
            _policyPersonInsuredCategoryRepository = policyPersonInsuredCategoryRepository;
            _policyInsuredSumAssuredRepository = policyInsuredSumAssuredRepository;
            _invoiceService = invoiceService;
            _benefitPayrollRepository = benefitPayrollRepository;
            _rolePlayerRelationRepository = rolePlayerRelationRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _personRepository = personRepository;
            _personEmploymentRepository = personEmploymentRepository;
            _funeralInsuredTypeRepository = funeralInsuredTypeRepository;
            _BenefitCategoryFuneralRepository = benefitCategoryFuneral;
        }

        public async Task<List<ReinsuranceTreaty>> GetReinsuranceTreaties()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _reinurerTreatyRepository.OrderBy(x => x.TreatyName).ToListAsync();
                return Mapper.Map<List<ReinsuranceTreaty>>(entities);
            }
        }

        public async Task<List<Reinsurer>> GetReinsurers()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _reinurerRepository.OrderBy(x => x.Name).ToListAsync();
                return Mapper.Map<List<Reinsurer>>(entities);
            }
        }

        public async Task<List<BenefitOptionItemValueResponse>> GetOptionItemValues(string optionLevel, string optionCode, int benefitId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var optionItemValues = await _productBenefitOptionItemValueRepository.Where(x => x.BenefitId == benefitId && x.OptionItem.OptionType.OptionLevel == optionLevel &&
                                                                                     x.OptionItem.OptionType.Code == optionCode)
                                                                              .ToListAsync();
                await _productBenefitOptionItemValueRepository.LoadAsync(optionItemValues, x => x.OptionItem);
                return Mapper.Map<List<BenefitOptionItemValueResponse>>(optionItemValues);
            }
        }

        public async Task<List<ProductOptionItemValuesResponse>> GetProductOptionOptionItemValues(string typeCode, int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptionOptionItemValues = await _productOptionItemValueRepository.Where(x => x.ProductOptionId == productOptionId && x.OptionItem.OptionType.OptionLevel == "PolicyOption" &&
                                                                                                       x.OptionItem.OptionType.Code == typeCode).ToListAsync();
                await _productOptionItemValueRepository.LoadAsync(productOptionOptionItemValues, x => x.OptionItem);
                await _optionItemRepository.LoadAsync(productOptionOptionItemValues.Select(x => x.OptionItem).ToList(), x => x.OptionType);
                return Mapper.Map<List<ProductOptionItemValuesResponse>>(productOptionOptionItemValues);
            }
        }

        public async Task<GroupRiskPolicy> CreatePolicyNumber(int employerRolePlayerId,
            GroupRiskPolicy groupRiskPolicy)
        {

            if (groupRiskPolicy == null || employerRolePlayerId == 0)
            {
                return null;
            }

            if (groupRiskPolicy.PolicyId == 0)
            {
                groupRiskPolicy.PolicyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
            }

            var productOptions =
                await _productOptionService.GetProductOptionNamesByProductId(groupRiskPolicy.ProductId);
            if (productOptions == null)
            {
                return groupRiskPolicy;
            }
            var selectedProductOption =
                productOptions.FirstOrDefault(x => x.Id == groupRiskPolicy.ProductOptionId);

            if (selectedProductOption == null)
            {
                return groupRiskPolicy;
            }

            var policyNumber =
                $"{_clientReferencePrefix}-{employerRolePlayerId}-{selectedProductOption.Code}-{groupRiskPolicy.PolicyId}";
            groupRiskPolicy.PolicyNumber = policyNumber;

            return groupRiskPolicy;

        }

        public async Task<bool> CreateSchemePolicies(GroupRiskCaseModel groupRiskCaseModel)
        {

            if (groupRiskCaseModel == null || groupRiskCaseModel.GroupRiskPolicies.Count == 0)
            {
                return false;
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyIds = groupRiskCaseModel.GroupRiskPolicies.Select(x => x.PolicyId).ToList();

                var policies = await _policyRepository.Where(x => policyIds.Contains(x.PolicyId)).ToListAsync();
                foreach (var groupRiskPolicy in groupRiskCaseModel.GroupRiskPolicies)
                {
                    var policyExist = policies?.Find(x => x.PolicyId == groupRiskPolicy.PolicyId);

                    if (policyExist != null)
                    {
                        continue;
                    }

                    var policyOptions = new List<policy_PolicyOption>();
                    foreach (var policyOption in groupRiskPolicy.PolicyOptions)
                    {
                        policyOptions.Add(new policy_PolicyOption
                        {
                            PolicyId = groupRiskPolicy.PolicyId,
                            ProductOptionOptionItemValueId = policyOption.ProductOptionOptionItemValueId,
                            EffectiveDate = groupRiskPolicy.StartDate.Date,
                            OverrideValue = policyOption.OverrideValue,
                        });
                    }

                    var policyEntity = new policy_Policy
                    {
                        PolicyId = groupRiskPolicy.PolicyId,
                        TenantId = 1,
                        InsurerId = 1,
                        ProductOptionId = groupRiskPolicy.ProductOptionId,
                        BrokerageId = groupRiskPolicy.BrokerageId,
                        RepresentativeId = _groupRiskDummyRepresentativeId,
                        JuristicRepresentativeId = _groupRiskDummyRepresentativeId,
                        PolicyOwnerId = groupRiskCaseModel.EmployerRolePlayerId,
                        PolicyPayeeId = groupRiskCaseModel.EmployerRolePlayerId,
                        PaymentFrequency = (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId,
                        PaymentMethod = PaymentMethodEnum.EFT,
                        PolicyNumber = groupRiskPolicy.PolicyNumber,
                        PolicyInceptionDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.StartDate),
                        FirstInstallmentDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.StartDate),
                        ExpiryDate = groupRiskPolicy.EndDate.HasValue ? DateTimeHelper.EndOfTheMonth(groupRiskPolicy.EndDate.Value): groupRiskPolicy.EndDate,
                        RegularInstallmentDayOfMonth = 1,
                        DecemberInstallmentDayOfMonth = 1,
                        PolicyStatus = (PolicyStatusEnum)groupRiskPolicy.SchemeStatusId,
                        InstallmentPremium = 0,
                        AnnualPremium = 0,
                        AdminPercentage = 0,
                        CommissionPercentage = 0,
                        BinderFeePercentage = 0,
                        PremiumAdjustmentPercentage = 0,
                        ParentPolicyId = null,
                        CanLapse = true,
                        IsEuropAssist = false,
                        PolicyOptions = policyOptions,
                        CreatedBy = RmaIdentity.Email,
                        ModifiedBy = RmaIdentity.Email,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedDate = DateTimeHelper.SaNow

                    };
                    _policyRepository.Create(policyEntity);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            _ = await CreateSchemePolicieDependencies(groupRiskCaseModel);
            _ = await CreatePolicyBenefits(groupRiskCaseModel);
            _ = await CreatePolicyBenefitCategories(groupRiskCaseModel);

            return true;
        }

        public async Task<List<BenefitOptionItemValueResponse>> GetBenefitOptionItemValues(string optionLevel, int benefitId)
        {
            List<BenefitOptionItemValueResponse> result = new List<BenefitOptionItemValueResponse>();
            if (!string.IsNullOrEmpty(optionLevel) && benefitId > 0)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var optionItemValues = await _productBenefitOptionItemValueRepository.Where(x => x.BenefitId == benefitId && x.OptionItem.OptionType.OptionLevel == optionLevel)
                                                                                  .ToListAsync();
                    await _productBenefitOptionItemValueRepository.LoadAsync(optionItemValues, x => x.OptionItem);
                    foreach (var item in optionItemValues)
                    {
                        await _optionItemRepository.LoadAsync(item.OptionItem, x => x.OptionType);
                    }
                    result= Mapper.Map<List<BenefitOptionItemValueResponse>>(optionItemValues);
                }
            }
            return result;
        }

        public async Task<BenefitOptionItemValueResponse> GetBenefitOptionItemValue(int policyId, int benefitId, string optionTypeCode, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitOptionItemValue = await _policyBenefitOptionRepository.Join(_policyBenefitDetailRepository, bo => bo.BenefitDetailId, bd => bd.BenefitDetailId, (bo, bd) => new { bo, bd })
                                                                                 .Where(p => p.bo.BenefitOptionItemValue.OptionItem.OptionType.Code == optionTypeCode
                                                                                       && p.bo.EffectiveDate <= effectiveDate.Date.Date && p.bd.PolicyId == policyId && p.bd.BenefitId == benefitId)
                                                                                 .Select(s => s.bo)
                                                                               .GroupBy(g => g.BenefitOptionItemValue.OptionItem.OptionType.Code)
                                                                               .Select(s => s.OrderByDescending(o => o.EffectiveDate).FirstOrDefault(r => r.BenefitOptionItemValue.OptionItem.OptionType.Code == s.Key))
                                                                               .Select(s => new BenefitOptionItemValueResponse
                                                                               {
                                                                                   BenefitOptionItemValueId = s.BenefitOptionItemValueId,
                                                                                   BenefitId = s.PolicyBenefitDetail.BenefitId,
                                                                                   OptionItemName = s.BenefitOptionItemValue.OptionItem.Name,
                                                                                   OptionItemCode = s.BenefitOptionItemValue.OptionItem.Code,
                                                                                   OverrideValue = s.OverrideValue,
                                                                                   OptionItemField = s.BenefitOptionItemValue.OptionItemField,
                                                                                   OptionTypeCode = s.BenefitOptionItemValue.OptionItem.OptionType.Code
                                                                               }).FirstOrDefaultAsync();

                return benefitOptionItemValue; 
            }
        }

        public async Task<List<ProductOptionItemValuesResponse>> GetProductOptionOptionItems(int productOptionId)
        {
            return await GetProductOptionItems(productOptionId, false);

        }
        public async Task<List<ProductOptionItemValuesResponse>> GetProductOptionItemsWithOverrideValues(int productOptionId)
        {
            return await GetProductOptionItems(productOptionId, true);
        }

        private async Task<List<ProductOptionItemValuesResponse>> GetProductOptionItems(int productOptionId, bool withValueOverride)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<product_ProductOptionOptionItemValue> productOptionItems;
                if (withValueOverride)
                {
                    productOptionItems = await _productOptionItemValueRepository.Where(x => x.ProductOptionId == productOptionId && x.OptionItem.OptionType.OptionLevel == "PolicyOption" && x.Value != null)
                                                                                .ToListAsync();
                }
                else
                {
                    productOptionItems = await _productOptionItemValueRepository.Where(x => x.ProductOptionId == productOptionId && x.OptionItem.OptionType.OptionLevel == "PolicyOption").ToListAsync();
                }
                await _productOptionItemValueRepository.LoadAsync(productOptionItems, x => x.OptionItem);
                await _optionItemRepository.LoadAsync(productOptionItems.Select(x => x.OptionItem).ToList(), x => x.OptionType);

                return Mapper.Map<List<ProductOptionItemValuesResponse>>(productOptionItems);
            }
        }

        private async Task<bool> CreatePolicyBenefits(GroupRiskCaseModel groupRiskCaseModel)
        {
            if (groupRiskCaseModel != null)
            {
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        foreach (var groupRiskPolicy in groupRiskCaseModel.GroupRiskPolicies)
                        {
                            if (groupRiskPolicy != null && groupRiskPolicy.GroupRiskPolicyBenefits.Count > 0)
                            {
                                foreach (var policyBenefit in groupRiskPolicy.GroupRiskPolicyBenefits)
                                {
                                    SqlParameter[] parameters = {
                                    new SqlParameter("policyId", groupRiskPolicy.PolicyId),
                                    new SqlParameter("benefitId", policyBenefit.BenefitId)
                                };

                                    await _policyRepository.ExecuteSqlCommandAsync(DatabaseConstants.InsertPolicyBenefit, parameters);

                                    var policyBenefitDetail = new policy_PolicyBenefitDetail
                                    {
                                        PolicyId = groupRiskPolicy.PolicyId,
                                        BenefitId = policyBenefit.BenefitId,
                                        StartDate = DateTimeHelper.StartOfTheMonth(policyBenefit.NewEffectiveDate),
                                        EndDate = policyBenefit.EndDate.HasValue ? DateTimeHelper.EndOfTheMonth(policyBenefit.EndDate.Value.Date) : policyBenefit.EndDate,
                                        CreatedBy = RmaIdentity.Email,
                                        ModifiedBy = RmaIdentity.Email,
                                        CreatedDate = DateTimeHelper.SaNow,
                                        ModifiedDate = DateTimeHelper.SaNow,
                                    };
                                    _policyBenefitDetailRepository.Create(policyBenefitDetail);

                                    List<policy_PolicyBenefitOption> benefitOptions = new List<policy_PolicyBenefitOption>();
                                    foreach (var benefitOption in policyBenefit.BenefitOptions)
                                    {
                                        benefitOptions.Add(new policy_PolicyBenefitOption
                                        {
                                            BenefitOptionItemValueId = benefitOption.BenefitOptionItemValueId,
                                            PolicyBenefitDetail = policyBenefitDetail,
                                            EffectiveDate = DateTimeHelper.StartOfTheMonth(policyBenefit.NewEffectiveDate),
                                            OverrideValue = benefitOption.OverrideValue,
                                            IsDeleted = false,
                                        });
                                    }

                                    _policyBenefitOptionRepository.Create(benefitOptions);

                                }

                            }
                        }
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
                catch (System.Exception ex)
                {
                    ex.LogException();
                }
            }
            return true;
        }

        private async Task<bool> CreateSchemePolicieDependencies(GroupRiskCaseModel groupRiskCaseModel)
        {
            if (groupRiskCaseModel != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    foreach (var groupRiskPolicy in groupRiskCaseModel.GroupRiskPolicies)
                    {

                        var policyBroker = new policy_PolicyBroker
                        {
                            PolicyId = groupRiskPolicy.PolicyId,
                            BrokerageId = groupRiskPolicy.BrokerageId,
                            RepId = _groupRiskDummyRepresentativeId,
                            EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                            CreatedBy = RmaIdentity.Email,
                            ModifiedBy = RmaIdentity.Email,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedDate = DateTimeHelper.SaNow,
                        };
                        _policyBrokerRepository.Create(policyBroker);


                        var policyTreaty = new policy_PolicyTreaty
                        {
                            PolicyId = groupRiskPolicy.PolicyId,
                            TreatyId = groupRiskPolicy.ReinsuranceTreatyId,
                            EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                            CreatedBy = RmaIdentity.Email,
                            ModifiedBy = RmaIdentity.Email,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedDate = DateTimeHelper.SaNow,
                        };
                        _policyTreatyRepository.Create(policyTreaty);

                        var policyDetail = new policy_PolicyDetail
                        {
                            PolicyId = groupRiskPolicy.PolicyId,
                            PolicyAdministratorId = groupRiskPolicy.AdministratorId,
                            PolicyConsultantId = groupRiskPolicy.RmaRelationshipManagerId,
                            PolicyAnniversaryMonth = (byte)groupRiskPolicy.AnniversaryMonthTypeId,
                            PaymentFrequency = (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId,
                            EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                            NextReviewDate = groupRiskPolicy.NextRateReviewDate.HasValue ? groupRiskPolicy.NextRateReviewDate.Value.Date : groupRiskPolicy.NextRateReviewDate,
                            LastReviewDate = groupRiskPolicy.LastRateUpdateDate.HasValue ? groupRiskPolicy.LastRateUpdateDate.Value.Date : groupRiskPolicy.LastRateUpdateDate,
                            PolicyHolderId = groupRiskPolicy.FundRolePlayerId,
                            PolicyName = groupRiskPolicy.ClientReference,
                            CreatedBy = RmaIdentity.Email,
                            ModifiedBy = RmaIdentity.Email,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedDate = DateTimeHelper.SaNow,
                        };
                        _policyDetailRepository.Create(policyDetail);

                        var policyBinder = new policy_PolicyBinder
                        {
                            PolicyId = groupRiskPolicy.PolicyId,
                            EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                            BinderId = groupRiskPolicy.BinderPartnerId,
                            CreatedBy = RmaIdentity.Email,
                            ModifiedBy = RmaIdentity.Email,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedDate = DateTimeHelper.SaNow
                        };
                        _policyBinderrRepository.Create(policyBinder);

                        var options = await _brokerageService.GetProductOptionConfigurationsByProductOptionId(groupRiskPolicy.ProductOptionId, groupRiskPolicy.NewEffectiveDate);

                        if (options != null)
                        {
                            foreach (var optionTypeCode in _policyOptionOptionTypeCodes)
                            {
                                var groupRiskPolicyOptionValue = GroupRiskPolicyCaseUtility.GetPolicyStringOptionValue(groupRiskPolicy, optionTypeCode);
                                var option = options.Find(x => x.OptionTypeCode == optionTypeCode && x.OptionItemCode == groupRiskPolicyOptionValue);

                                if (option != null)
                                {
                                    var isDescimalValue = decimal.TryParse(groupRiskPolicyOptionValue, out decimal convertedDecimalValue);

                                    var policyOption = new policy_PolicyOption
                                    {
                                        PolicyId = groupRiskPolicy.PolicyId,
                                        ProductOptionOptionItemValueId = option.ProductOptionOptionItemValueId.Value,
                                        PolicyOptionId = groupRiskPolicy.ProductOptionId,
                                        OverrideValue = groupRiskPolicyOptionValue != null && isDescimalValue ? convertedDecimalValue : option.ProductOptionOptionValue,
                                        EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                                        CreatedBy = RmaIdentity.Email,
                                        ModifiedBy = RmaIdentity.Email,
                                        CreatedDate = DateTimeHelper.SaNow,
                                        ModifiedDate = DateTimeHelper.SaNow,

                                    };
                                    _policyOptionRepository.Create(policyOption);
                                }
                            }
                        }
                    }

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            return true;
        }

        private List<policy_PolicyBenefitCategory> GetBenefitCategoriesForBenefit(List<GroupRiskPolicyBenefitCategory> benefitCategories, int benefitDetailId = 0)
        {
            List<policy_PolicyBenefitCategory> policyBenefitCategories = new List<policy_PolicyBenefitCategory>();
            foreach (var benefitCategory in benefitCategories)
            {
                List<policy_BenefitCategoryExtension> categoryExtensions = new List<policy_BenefitCategoryExtension>();
                categoryExtensions.Add(new policy_BenefitCategoryExtension
                {
                    EffectiveDate = DateTimeHelper.StartOfTheMonth(benefitCategory.NewEffectiveDate),
                    IsCategoryBilling = false,
                    FlatCoverAmount = benefitCategory.FlatCoverAmount,
                    WaiverPercentage = benefitCategory.EmployerWaiver ?? 0,
                    SalaryMultiple = benefitCategory.SalaryMultiple ?? 0,
                    FuneralCoverTypeId = benefitCategory.FuneralCoverTypeId.HasValue ? (int?)benefitCategory.FuneralCoverTypeId : null,
                    CreatedBy = RmaIdentity.Username,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = RmaIdentity.Username,
                    ModifiedDate = DateTimeHelper.SaNow

                });

                List<policy_BenefitCategoryOption> benefitCategoryOptions = new List<policy_BenefitCategoryOption>();
                foreach (var categoryOption in benefitCategory.CategoryOptions)
                {
                    if (categoryOption == null) continue;
                    benefitCategoryOptions.Add(new policy_BenefitCategoryOption
                    {
                        IsDeleted = false,
                        EffectiveDate = DateTimeHelper.StartOfTheMonth(benefitCategory.NewEffectiveDate),
                        BenefitOptionItemValueId = categoryOption.BenefitOptionItemValueId,
                        OverrideValue = categoryOption.OverrideValue,
                        CreatedBy = RmaIdentity.Username,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedBy = RmaIdentity.Username,
                        ModifiedDate = DateTimeHelper.SaNow
                    });
                }

                List<policy_BenefitCategoryFuneral> benefitCategoryFuneralScales = new List<policy_BenefitCategoryFuneral>();
                foreach (var funeralScale in benefitCategory.FuneralScales ?? Enumerable.Empty<BenefitCategoryFuneral>())
                {
                    benefitCategoryFuneralScales.Add(new policy_BenefitCategoryFuneral
                    {
                        EffectiveDate = DateTimeHelper.StartOfTheMonth(funeralScale.EffectiveDate),
                        FuneralInsuredTypeId = funeralScale.FuneralInsuredTypeId,
                        CoverAmount = funeralScale.CoverAmount,
                        CreatedBy = RmaIdentity.Username,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedBy = RmaIdentity.Username,
                        ModifiedDate = DateTimeHelper.SaNow,
                        IsDeleted = false
                    });
                }

                var newCategory = new policy_PolicyBenefitCategory
                {
                    Name = benefitCategory.Name,
                    Description = benefitCategory.CategoryDescription,
                    StartDate = DateTimeHelper.StartOfTheMonth(benefitCategory.StartDate),
                    EndDate = benefitCategory.EndDate.HasValue ? benefitCategory.EndDate.Value.Date : benefitCategory.EndDate,
                    IsDeleted = false,
                    BenefitCategoryOptions = benefitCategoryOptions,
                    BenefitCategoryExtensions = categoryExtensions,
                    BenefitCategoryFunerals = benefitCategory.FuneralCoverTypeId == FuneralCoverTypeEnum.CustomScale ? benefitCategoryFuneralScales : null,
                    CreatedBy = RmaIdentity.Username,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = RmaIdentity.Username,
                    ModifiedDate = DateTimeHelper.SaNow
                };

                if (benefitDetailId > 0)
                {
                    newCategory.BenefitDetailId = benefitDetailId;
                }


                policyBenefitCategories.Add(newCategory);


            }

            return policyBenefitCategories;
        }

        private async Task<bool> CreatePolicyBenefitCategories(GroupRiskCaseModel groupRiskCaseModel)
        {
            if (groupRiskCaseModel != null)
            {
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        foreach (var groupRiskPolicy in groupRiskCaseModel.GroupRiskPolicies)
                        {
                            foreach (var benefit in groupRiskPolicy.GroupRiskPolicyBenefits)
                            {
                                var benefitDetail = await _policyBenefitDetailRepository.Where(x => x.PolicyId == groupRiskPolicy.PolicyId && x.BenefitId == benefit.BenefitId && x.IsDeleted == false).FirstOrDefaultAsync();
                                if (benefitDetail == null) continue;

                                foreach (var benefitCategory in benefit.BenefitCategories)
                                {
                                    List<policy_BenefitCategoryExtension> categoryExtensions = new List<policy_BenefitCategoryExtension>();
                                    categoryExtensions.Add(new policy_BenefitCategoryExtension
                                    {
                                        EffectiveDate = DateTimeHelper.StartOfTheMonth(benefitCategory.NewEffectiveDate),
                                        IsCategoryBilling = false,
                                        FlatCoverAmount = benefitCategory.FlatCoverAmount,
                                        WaiverPercentage = benefitCategory.EmployerWaiver ?? 0,
                                        SalaryMultiple = benefitCategory.SalaryMultiple ?? 0,
                                        FuneralCoverTypeId = benefitCategory.FuneralCoverTypeId.HasValue ? (int?)benefitCategory.FuneralCoverTypeId.Value : null,
                                        CreatedBy = RmaIdentity.Username,
                                        CreatedDate = DateTimeHelper.SaNow,
                                        ModifiedBy = RmaIdentity.Username,
                                        ModifiedDate = DateTimeHelper.SaNow,
                                    });

                                    List<policy_BenefitCategoryOption> benefitCategoryOptions = new List<policy_BenefitCategoryOption>();
                                    foreach (var categoryOption in benefitCategory.CategoryOptions)
                                    {
                                        if (categoryOption == null) continue;
                                        benefitCategoryOptions.Add(new policy_BenefitCategoryOption
                                        {
                                            IsDeleted = false,
                                            EffectiveDate = DateTimeHelper.StartOfTheMonth(benefitCategory.NewEffectiveDate),
                                            BenefitOptionItemValueId = categoryOption.BenefitOptionItemValueId,
                                            OverrideValue = categoryOption.OverrideValue,
                                            CreatedBy = RmaIdentity.Username,
                                            CreatedDate = DateTimeHelper.SaNow,
                                            ModifiedBy = RmaIdentity.Username,
                                            ModifiedDate = DateTimeHelper.SaNow,
                                        });
                                    }

                                    var funeralBenefitScales = new List<policy_BenefitCategoryFuneral>();
                                    foreach (var funeralScale in benefitCategory.FuneralScales ?? Enumerable.Empty<BenefitCategoryFuneral>())
                                    {
                                        funeralBenefitScales.Add(new policy_BenefitCategoryFuneral
                                        {
                                            EffectiveDate = DateTimeHelper.StartOfTheMonth(funeralScale.EffectiveDate),
                                            FuneralInsuredTypeId = funeralScale.FuneralInsuredTypeId,
                                            CoverAmount = funeralScale.CoverAmount,
                                            IsDeleted = false,
                                            CreatedBy = RmaIdentity.Username,
                                            CreatedDate = DateTimeHelper.SaNow,
                                            ModifiedBy = RmaIdentity.Username,
                                            ModifiedDate = DateTimeHelper.SaNow,
                                        });
                                    }

                                    var newCategory = new policy_PolicyBenefitCategory
                                    {
                                        BenefitDetailId = benefitDetail.BenefitDetailId,
                                        Name = benefitCategory.Name,
                                        Description = benefitCategory.CategoryDescription,
                                        StartDate = DateTimeHelper.StartOfTheMonth(benefitCategory.StartDate),
                                        EndDate = benefitCategory.EndDate.HasValue ? benefitCategory.EndDate.Value.Date : benefitCategory.EndDate,
                                        IsDeleted = false,
                                        BenefitCategoryOptions = benefitCategoryOptions,
                                        BenefitCategoryExtensions = categoryExtensions,
                                        CreatedBy = RmaIdentity.Email,
                                        CreatedDate = DateTimeHelper.SaNow,
                                        ModifiedBy = RmaIdentity.Email,
                                        ModifiedDate = DateTimeHelper.SaNow,
                                        BenefitCategoryFunerals = benefitCategory.FuneralCoverTypeId == FuneralCoverTypeEnum.CustomScale ? funeralBenefitScales : null
                                    };

                                    _policyBenefitCategoryRepository.Create(newCategory, true);
                                }
                            }
                        }

                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }

                    return true;
                }
                catch (System.Exception ex)
                {
                    ex.LogException();
                }
            }
            return false;
        }

        public async Task<List<PolicyDetail>> GetPolicyDetailByEmployerRolePlayerId(int employerRolePlayerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _policyDetailRepository.Join(_policyRepository, d => d.PolicyId, p => p.PolicyId, (d, p) => new { d, p })
                                                              .Where(x => x.p.PolicyOwnerId == employerRolePlayerId)
                                                              .Select(x => x.d)
                                                              .GroupBy(g => g.PolicyId)
                                                              .Select(gr => gr.OrderByDescending(d => d.EffectiveDate).FirstOrDefault(f => f.PolicyId == gr.Key))
                                                              .ToListAsync();

                                                       
                return Mapper.Map<List<PolicyDetail>>(entities);
            }
        }

        public async Task<List<PolicyBenefitDetail>> GetPolicyBenefitDetail(List<int> policyIds)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from policyBenefitDetail in _policyBenefitDetailRepository.Where(x => policyIds.Contains(x.PolicyId))
                                      select policyBenefitDetail).ToListAsync();
                await _policyBenefitDetailRepository.LoadAsync(entities, x => x.BenefitRates);
                return Mapper.Map<List<PolicyBenefitDetail>>(entities);
            }
        }

        public async Task<List<PolicyBenefitDetail>> GetPolicyBenefitDetailByPolicyId(List<int> policyIds)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (
                    from policy in _policyRepository.Where(x => policyIds.Contains(x.PolicyId))
                    join policyDetail in _policyDetailRepository on policy.PolicyId equals policyDetail.PolicyId
                    join policyBenefitDetail in _policyBenefitDetailRepository on policy.PolicyId equals policyBenefitDetail.PolicyId
                    join benefit in _benefitRepository on policyBenefitDetail.BenefitId equals benefit.Id
                    join policyBenefitRate in _policyBenefitRateRepository on policyBenefitDetail.BenefitDetailId equals policyBenefitRate.BenefitDetailId
                    join policyBenefitCategory in _policyBenefitCategoryRepository on policyBenefitDetail.BenefitDetailId equals policyBenefitCategory.BenefitDetailId into benefitCategoryGroup
                    from policyBenefitCategory in benefitCategoryGroup.DefaultIfEmpty()
                    select new
                    {
                        Policy = policy,
                        PolicyDetail = policyDetail,
                        Benefit = benefit,
                        BenefitDetail = policyBenefitDetail,
                        BenefitRate = policyBenefitRate,
                        BenefitCategory = policyBenefitCategory
                    }
                ).ToListAsync();

                if (entities == null || !entities.Any())
                {
                    return new List<PolicyBenefitDetail>();
                }

                // Group the results by policy benefit details and map them to the result type
                var policyBenefitDetails = entities.GroupBy(e => e.BenefitDetail)
                    .Select(group =>
                    {
                        var benefitDetail = group.Key;
                        benefitDetail.BenefitRates = group.Select(e => e.BenefitRate).ToList();
                        return benefitDetail;
                    }).ToList();

                return Mapper.Map<List<PolicyBenefitDetail>>(policyBenefitDetails);
            }
        }


        public async Task<List<Benefit>> GetPolicyBenefit(int policyId)
        {
            List <Benefit> result= null;
            if (policyId > 0)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await (from policyBenefitDetail in _policyBenefitDetailRepository.Where(x => x.PolicyId == policyId)
                                          join benefit in _benefitRepository on policyBenefitDetail.BenefitId equals benefit.Id
                                          select benefit).ToListAsync();

                    result= Mapper.Map<List<Benefit>>(entities);
                }
            }
            return result;
        }

        public async Task<List<PolicyBenefitCategory>> GetPolicyBenefitCategoryDetail(int benefitDetaildId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from policyBenefitCategory in _policyBenefitCategoryRepository.Where(x => x.BenefitDetailId == benefitDetaildId)
                                      select policyBenefitCategory).ToListAsync();
                return Mapper.Map<List<PolicyBenefitCategory>>(entities);
            }
        }

        public async Task<List<PolicyBenefitCategory>> GetPolicyBenefitCategory(int policyId, int benefitId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from policyBenefitDetail in _policyBenefitDetailRepository.Where(x => x.PolicyId == policyId && x.BenefitId == benefitId)
                                      join policyBenefitCategory in _policyBenefitCategoryRepository on policyBenefitDetail.BenefitDetailId equals policyBenefitCategory.BenefitDetailId

                                      select policyBenefitCategory).ToListAsync();
                return Mapper.Map<List<PolicyBenefitCategory>>(entities);
            }
        }


        public async Task<List<PremiumRateComponentModel>> GetPremiumRateComponentModel()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await (from premiumComponent in _premiumComponentRepository
                                      select premiumComponent).ToListAsync();

                return entities.Select(x => new PremiumRateComponentModel
                {
                    ComponentId = x.PremiumComponentId,
                    ComponentName = x.Name,
                    ComponentCode = x.Code
                }).ToList();

            }
        }

        public async Task<List<PremiumRateComponentModel>> GetBenefitRateDetailByBenefitRateIds(List<int> benefitRateIds)
        {
            List<PremiumRateComponentModel> entities = null;
            if(benefitRateIds != null && benefitRateIds.Count > 0) {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    entities = await (from benefitRateDetal in _policyBenefitRateDetailRepository.Where(x => benefitRateIds.Contains(x.BenefitRateId))
                                          join premiumComponent in _premiumComponentRepository on benefitRateDetal.PremiumComponentId equals premiumComponent.PremiumComponentId
                                          select new PremiumRateComponentModel
                                          {
                                              BenefitRateDetailId = benefitRateDetal.BenefitRateDetailId,
                                              BenefitRateId = benefitRateDetal.BenefitRateId,
                                              ComponentId = premiumComponent.PremiumComponentId,
                                              ComponentCode = premiumComponent.Code,
                                              ComponentName = premiumComponent.Name,
                                              TotalRateComponentValue = Math.Round(benefitRateDetal.RateDetailValue, 6),
                                              AllowNegativeValue = premiumComponent.AllowNegativeValue

                                          }).ToListAsync();
                }

            }
            return entities;
        }

        public async Task<PolicyBenefitRate> GetPolicyBenefitRate(int benefitDetailId, int? benefitCategoryId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!benefitCategoryId.HasValue)
                    benefitCategoryId = -1;

                var benefitRate = await _policyBenefitRateRepository.Where(b => b.BenefitDetailId == benefitDetailId && b.IsActive
                                                                            && (benefitCategoryId <= 0 ? b.BenefitCategoryId == null : b.BenefitCategoryId == benefitCategoryId)
                                                                            && b.EffectiveDate <= effectiveDate.Date)
                                                                    .OrderByDescending(o => o.EffectiveDate)
                                                                    .FirstOrDefaultAsync();

                return new PolicyBenefitRate
                {
                    BenefitRateId = benefitRate?.BenefitRateId ?? 0,
                    BenefitDetailId = benefitRate?.BenefitDetailId ?? 0,
                    BenefitCategoryId = benefitRate?.BenefitCategoryId,
                    EffectiveDate = benefitRate?.EffectiveDate ?? DateTime.MinValue,
                    RateStatus = benefitRate?.RateStatus ?? RateStatusEnum.Unauthorised,
                    BillingBasis = benefitRate?.BillingBasis,
                    RateValue = benefitRate?.RateValue ?? 0,
                    IsPercentageSplit = benefitRate?.IsPercentageSplit ?? false,
                    IsActive = benefitRate?.IsActive ?? false
                };
            }
        }

        public async Task<List<ReinsuranceTreaty>> GetPolicyReinsuranceTreaty(int policyId, DateTime effectiveDate)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var policyTreaty = await _policyTreatyRepository.Where(x => x.PolicyId == policyId && x.EffectiveDate <= effectiveDate.Date)
                                                         .OrderByDescending(o => o.EffectiveDate)
                                                         .FirstOrDefaultAsync();

                if (policyTreaty != null)
                {
                    await _policyTreatyRepository.LoadAsync(policyTreaty, x => x.Treaty);
                }
                
                return policyTreaty == null ? null : new List<ReinsuranceTreaty> { Mapper.Map<ReinsuranceTreaty>(policyTreaty.Treaty) };
            }
        }

        private async Task<List<common_OptionItem>> GetBenefitDetailOptionItem(int benefitDetailId, string optionTypeCode, DateTime effectiveDate)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var optionItems = await (from benefitOption in _policyBenefitOptionRepository
                                         join benefitOptionItemValue in _productBenefitOptionItemValueRepository on benefitOption.BenefitOptionItemValueId equals benefitOptionItemValue.BenefitOptionItemValueId
                                         join optionItem in _optionItemRepository on benefitOptionItemValue.OptionItemId equals optionItem.OptionItemId
                                         join optionType in _optionTypeRepository on optionItem.OptionTypeId equals optionType.OptionTypeId

                                         where benefitOption.BenefitDetailId == benefitDetailId &&
                                               optionType.Code == optionTypeCode &&
                                               benefitOption.EffectiveDate <= effectiveDate
                                         orderby benefitOption.EffectiveDate descending
                                         select optionItem).ToListAsync();

                return optionItems;

            }

        }

        public async Task<List<PolicyPremiumRateDetailModel>> GetEmployerPolicyPremiumRateDetail(int employerRolePlayerId, string query = "")
        {
            var policyPremiumRateDetailModel = new List<PolicyPremiumRateDetailModel>();
            List<PolicyPremiumRateDetailModel> distinctPolicyPremiumRateDetailModel = null;
            if (employerRolePlayerId > 0)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {

                    var policyPremiumRateDetailModelEntities = await _policyRepository.SqlQueryAsync<PolicyPremiumRateDetailModel>(
                       DatabaseConstants.BenefitRateSearch,
                       new SqlParameter("@PolicyOwnerId", employerRolePlayerId),
                       new SqlParameter("@EffectiveDate", DBNull.Value));

                    if (!string.IsNullOrEmpty(query))
                    {
                        policyPremiumRateDetailModelEntities = policyPremiumRateDetailModelEntities.Where(x => x.PolicyName.Contains(query) || x.BenefitName.Contains(query) || x.BenefitCategoryName.Contains(query)).ToList();
                    }

                    var benefitRateIds = policyPremiumRateDetailModelEntities.Select(x => x.BenefitRateId).Distinct().ToList();

                    var componets = await GetBenefitRateDetailByBenefitRateIds(benefitRateIds);
                    var policyPremiumRateDetailId = 0;

                    foreach (var policyPremiumRateDetailModelEntity in policyPremiumRateDetailModelEntities)
                    {

                        policyPremiumRateDetailModelEntity.PolicyPremiumRateDetailId = policyPremiumRateDetailId;
                        policyPremiumRateDetailModelEntity.PremiumRateComponentModels = new List<PremiumRateComponentModel>();
                        var compontsForPremiumDetail = componets.Where(x => x.BenefitRateId == policyPremiumRateDetailModelEntity.BenefitRateId).ToList();
                        policyPremiumRateDetailModelEntity.PremiumRateComponentModels.AddRange(compontsForPremiumDetail);
                        policyPremiumRateDetailModelEntity.BenefitReinsuranceAverageModels = await GetBenefitReinsuranceAverageByBenefitId(policyPremiumRateDetailModelEntity.PolicyId, policyPremiumRateDetailModelEntity.BenefitId, policyPremiumRateDetailModelEntity.EffectiveDate);
                        policyPremiumRateDetailId++;
                    }

                    policyPremiumRateDetailModel.AddRange(policyPremiumRateDetailModelEntities);
                }
            }
             distinctPolicyPremiumRateDetailModel = policyPremiumRateDetailModel.GroupBy(y => new { y.PolicyId, y.BenefitDetailId, y.BenefitRateId, y.BillingLevelCode, y.BillingMethodCode, y.EffectiveDate, y.EndDate, y.BenefitId, y.BenefitCategoryId })
                .Select(x => x.ToList().FirstOrDefault()).ToList();


            return distinctPolicyPremiumRateDetailModel;
        }

        public async Task<bool> CreatePremiumRates(GroupRiskEmployerPremiumRateModel groupRiskEmployerPremiumRateModel)
        {
            if (groupRiskEmployerPremiumRateModel == null)
            {
                return false;
            }

            var benefitReinsuranceAverageModels = new List<BenefitReinsuranceAverageModel>();

            foreach (var policyRate in groupRiskEmployerPremiumRateModel?.PolicyPremiumRateDetailModels)
            {
                var existingBenefitReinsuranceAverageModels = await GetBenefitReinsuranceAverage(policyRate.PolicyId, policyRate.BenefitDetailId, policyRate.EffectiveDate);

                if (policyRate.BenefitReinsuranceAverageModels.Count > 0)
                {

                    foreach (var averageReinsurance in policyRate.BenefitReinsuranceAverageModels)
                    {

                        if (!existingBenefitReinsuranceAverageModels.Any(existingBenefitReinsuranceAverageModel => existingBenefitReinsuranceAverageModel.BenefitDetailId == averageReinsurance.BenefitDetailId && existingBenefitReinsuranceAverageModel.BenefitReinsAverageId == averageReinsurance.BenefitReinsAverageId &&
                                existingBenefitReinsuranceAverageModel.ReinsAverage != null &&
                                (decimal?)Math.Round((double)existingBenefitReinsuranceAverageModel.ReinsAverage, 2) == averageReinsurance.ReinsAverage &&
                                existingBenefitReinsuranceAverageModel.TreatyId == averageReinsurance.TreatyId && averageReinsurance.ReinsAverage > 0

                        ))
                        {
                            averageReinsurance.EffectiveDate = policyRate.EffectiveDate;
                            benefitReinsuranceAverageModels.Add(averageReinsurance);
                        }
                    }
                }
            }

            if (benefitReinsuranceAverageModels.Count > 0)
            {
                _ = await UpdatetBenefitReinsuranceAverage(benefitReinsuranceAverageModels);
            }


            var policyIds = groupRiskEmployerPremiumRateModel?.PolicyPremiumRateDetailModels.Select(x => x.PolicyId).ToList();
            var policyBenefitDetailList = await GetPolicyBenefitDetail(policyIds);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var policyRate in groupRiskEmployerPremiumRateModel?.PolicyPremiumRateDetailModels)
                {
                    var policyBenefitDetail = policyBenefitDetailList.Find(x => x.PolicyId == policyRate.PolicyId && x.BenefitId == policyRate.BenefitId);

                    if (policyBenefitDetail == null)
                    {
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(policyRate.BillingMethodCode))
                    {
                        throw new ArgumentNullException($"{nameof(CreatePremiumRates)} --> Billing Basis is not set for policy: {policyRate.PolicyName} ,benefit: {policyRate.BenefitName} , effective date: {policyRate.EffectiveDate}");
                    }

                    var rateDetailArray = string.Join(";", policyRate.PremiumRateComponentModels.Select(y => $"{y.ComponentId},{(y.TotalRateComponentValue.ToString().IndexOf(',') >= 0 ? y.TotalRateComponentValue.ToString().Replace(',', '.') : y.TotalRateComponentValue.ToString())}"));
                    await _policyRepository.ExecuteSqlCommandAsync(
                       DatabaseConstants.CreateGroupRiskPolicyPremiumrates,
                       new SqlParameter("@BenefitDetailId", policyBenefitDetail.BenefitDetailId),
                       new SqlParameter("@BenefitCategoryId", policyRate.BillingLevelName == GroupRiskPolicyCaseUtility.BenefitBillingLevelName ? DBNull.Value : (object)policyRate.BenefitCategoryId),
                       new SqlParameter("@EffectiveDate", DateTimeHelper.StartOfTheMonth(policyRate.EffectiveDate).ToString("yyyy-MM-dd")),
                       new SqlParameter("@BillingBasis", policyRate.BillingMethodCode),
                       new SqlParameter("@RateDetail_Array", rateDetailArray),
                       new SqlParameter("@IsPercentageSplit", GroupRiskPolicyCaseUtility.IsPercentageSplit),
                       new SqlParameter("@RateStatusId", GroupRiskPolicyCaseUtility.RateStatusId),
                       new SqlParameter("@UserID", RmaIdentity.Email)
                        );

                }
            }


            return true;
        }


        private async Task<int> GetOptionItemValueId(int benefitId, string OptionTypeCode, string optionLevel)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var optionItemValues = await _productBenefitOptionItemValueRepository.Where(x => x.BenefitId == benefitId && x.OptionItem.OptionType.OptionLevel == optionLevel
                                                                                     && x.OptionItem.OptionType.Code == OptionTypeCode)
                                                                              .ToListAsync();

                if (optionItemValues.Any())
                    return optionItemValues[0].BenefitOptionItemValueId;
            }

            return 0;
        }

        public async Task<List<BenefitReinsuranceAverageModel>> GetBenefitReinsuranceAverage(int policyId, int benefitDetailId, DateTime effectiveDate)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var reinsuranceAverages = await _policyRepository.SqlQueryAsync<BenefitReinsuranceAverageModel>(
                     DatabaseConstants.BenefitReinsAverageSearch,
                     new SqlParameter("@PolicyId", policyId),
                     new SqlParameter("@BenefitDetailId", benefitDetailId),
                     new SqlParameter("@EffectiveDate", DateTimeHelper.StartOfTheMonth(effectiveDate).ToString("yyyy-MM-dd")));

                var treatyIds = reinsuranceAverages.Select(x => x.TreatyId).ToList();
                if (treatyIds.Count > 0)
                {
                    var treatyEntities = await _reinurerTreatyRepository.Where(x => treatyIds.Contains(x.TreatyId)).ToListAsync();
                    if (treatyEntities.Count > 0)
                    {
                        foreach (var reinsuranceAverage in reinsuranceAverages)
                        {

                            reinsuranceAverage.TreatyName = treatyEntities.Find(x => x.TreatyId == reinsuranceAverage.TreatyId)?.TreatyName;
                            reinsuranceAverage.ReinsAverage = reinsuranceAverage.ReinsAverage ?? 0;
                        }
                    }
                }

                return reinsuranceAverages;
            }
        }


        public async Task<List<BenefitReinsuranceAverageModel>> GetBenefitReinsuranceAverageByBenefitId(int policyId, int benefitId, DateTime effectiveDate)
        {
            var benefitReinsuranceAverageModel = new List<BenefitReinsuranceAverageModel>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyBenefitDetails = await _policyBenefitDetailRepository.Where(x => x.PolicyId == policyId && x.BenefitId == benefitId && x.StartDate <= effectiveDate).ToListAsync();


                if (policyBenefitDetails.Count > 0)
                {
                    foreach (var policyBenefitDetail in policyBenefitDetails)
                    {
                        var reinsuranceAverages = await _policyRepository.SqlQueryAsync<BenefitReinsuranceAverageModel>(
                                                   DatabaseConstants.BenefitReinsAverageSearch,
                                                   new SqlParameter("@PolicyId", policyId),
                                                   new SqlParameter("@BenefitDetailId", policyBenefitDetail.BenefitDetailId),
                                                   new SqlParameter("@EffectiveDate", DateTimeHelper.StartOfTheMonth(effectiveDate).ToString("yyyy-MM-dd")));

                        var treatyIds = reinsuranceAverages.Select(x => x.TreatyId).ToList();
                        if (treatyIds.Count > 0)
                        {
                            var treatyEntities = await _reinurerTreatyRepository.Where(x => treatyIds.Contains(x.TreatyId)).ToListAsync();
                            if (treatyEntities.Count > 0)
                            {
                                foreach (var reinsuranceAverage in reinsuranceAverages)
                                {
                                    reinsuranceAverage.TreatyName = treatyEntities.Find(x => x.TreatyId == reinsuranceAverage.TreatyId)?.TreatyName;
                                    reinsuranceAverage.ReinsAverage = reinsuranceAverage.ReinsAverage != null ? Math.Round(reinsuranceAverage.ReinsAverage.Value, 6) : 0;
                                    benefitReinsuranceAverageModel.Add(reinsuranceAverage);
                                }
                            }
                        }
                    }
                }

                return benefitReinsuranceAverageModel;
            }
        }

        public async Task<bool> UpdatetBenefitReinsuranceAverage(List<BenefitReinsuranceAverageModel> benefitReinsuranceAverageModels)
        {

            if (benefitReinsuranceAverageModels == null)
            {
                return false;
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                foreach (var benefitReinsuranceAverageModel in benefitReinsuranceAverageModels)
                {
                    benefitReinsuranceAverageModel.EffectiveDate = benefitReinsuranceAverageModel.EffectiveDate == DateTime.MinValue ? DateTimeHelper.StartOfTheMonth(DateTime.Now) :
                     DateTimeHelper.StartOfTheMonth(benefitReinsuranceAverageModel.EffectiveDate);

                    await _policyRepository.ExecuteSqlCommandAsync(
                    DatabaseConstants.BenefitReinsAverageUpsert,
                    new SqlParameter("@BenefitReinsAverageId", (object)benefitReinsuranceAverageModel.BenefitReinsAverageId ?? DBNull.Value),
                    new SqlParameter("@BenefitDetailId", benefitReinsuranceAverageModel.BenefitDetailId),
                    new SqlParameter("@EffectiveDate", benefitReinsuranceAverageModel.EffectiveDate.ToString("yyyy-MM-dd")),
                    new SqlParameter("@TreatyId", benefitReinsuranceAverageModel.TreatyId),
                    new SqlParameter("@ReinsAverage", benefitReinsuranceAverageModel.ReinsAverage == null ? 0 : benefitReinsuranceAverageModel.ReinsAverage),
                    new SqlParameter("@UserID", RmaIdentity.Email)
                   );
                }

                return true;
            }
        }

        public async Task<bool> UpdateSchemePolicies(GroupRiskCaseModel groupRiskCase)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    if (groupRiskCase == null)
                        return false;
                    foreach (var groupRiskPolicy in groupRiskCase.GroupRiskPolicies)
                    {
                        groupRiskPolicy.NewEffectiveDate = groupRiskPolicy.NewEffectiveDate.Date;
                        List<policy_PolicyOption> policyOptions = await _policyOptionRepository.Where(x => x.PolicyId == groupRiskPolicy.PolicyId).ToListAsync();
                        await _policyOptionRepository.LoadAsync(policyOptions, x => x.ProductOptionOptionItemValue);
                        await _productOptionItemValueRepository.LoadAsync(policyOptions.Select(x => x.ProductOptionOptionItemValue), x => x.OptionItem);
                        foreach (var policyOption in groupRiskPolicy.PolicyOptions)
                        {
                            foreach (var dbPolicyOption in policyOptions)
                            {
                                if (dbPolicyOption.PolicyOptionId == policyOption.PolicyOptionId)
                                {
                                    if (IsPolicyOptionChanged(dbPolicyOption, policyOption))
                                    {
                                        var optionTypeId = dbPolicyOption.ProductOptionOptionItemValue.OptionItem.OptionTypeId;
                                        var existingOption = policyOptions.Find(x => x.EffectiveDate.Date == groupRiskPolicy.NewEffectiveDate.Date && x.ProductOptionOptionItemValue != null &&
                                                                                               x.ProductOptionOptionItemValue.OptionItem.OptionTypeId == optionTypeId);
                                        if (existingOption != null)
                                        {
                                            existingOption.OverrideValue = policyOption.OverrideValue;
                                            existingOption.ProductOptionOptionItemValueId = policyOption.ProductOptionOptionItemValueId;
                                            existingOption.ModifiedBy = RmaIdentity.Username;
                                            existingOption.ModifiedDate = DateTimeHelper.SaNow;

                                            _policyOptionRepository.Update(existingOption, true);
                                        }
                                        else
                                        {
                                            _policyOptionRepository.Create(new policy_PolicyOption
                                            {
                                                PolicyId = dbPolicyOption.PolicyId,
                                                ProductOptionOptionItemValueId = policyOption.ProductOptionOptionItemValueId,
                                                OverrideValue = policyOption.OverrideValue,
                                                EffectiveDate = groupRiskPolicy.NewEffectiveDate.Date,
                                                CreatedBy = RmaIdentity.Username,
                                                CreatedDate = DateTimeHelper.SaNow,
                                                ModifiedBy = RmaIdentity.Username,
                                                ModifiedDate = DateTimeHelper.SaNow,
                                            }, true);
                                        }

                                    }


                                }
                            }
                        }

                        var policyDetails = await _policyDetailRepository.Where(x => x.PolicyId == groupRiskPolicy.PolicyId)
                                                                          .ToListAsync();
                        var policyDetail = policyDetails.Find(x => x.EffectiveDate == groupRiskPolicy.NewEffectiveDate.Date) ?? policyDetails.Find(x => x.EffectiveDate < groupRiskPolicy.NewEffectiveDate.Date);
                        if (policyDetail != null)
                        {
                            if (IsPolicyDetailsChanged(policyDetail, groupRiskPolicy))
                            {
                                if (policyDetail.EffectiveDate.Date == groupRiskPolicy.NewEffectiveDate.Date)
                                {
                                    policyDetail.PolicyAnniversaryMonth = (byte)groupRiskPolicy.AnniversaryMonthTypeId;
                                    policyDetail.PolicyAdministratorId = groupRiskPolicy.AdministratorId;
                                    policyDetail.PolicyConsultantId = groupRiskPolicy.RmaRelationshipManagerId;
                                    policyDetail.PolicyAnniversaryMonth = (byte)groupRiskPolicy.AnniversaryMonthTypeId;
                                    policyDetail.PaymentFrequency = (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId;
                                    policyDetail.NextReviewDate = groupRiskPolicy.NextRateReviewDate.HasValue ? groupRiskPolicy.NextRateReviewDate.Value.Date : groupRiskPolicy.NextRateReviewDate;
                                    policyDetail.LastReviewDate = groupRiskPolicy.LastRateUpdateDate.HasValue ? groupRiskPolicy.LastRateUpdateDate.Value.Date : groupRiskPolicy.LastRateUpdateDate;
                                    policyDetail.PolicyHolderId = groupRiskPolicy.FundRolePlayerId;
                                    policyDetail.PolicyName = groupRiskPolicy.ClientReference;
                                    policyDetail.ModifiedBy = RmaIdentity.Username;
                                    policyDetail.ModifiedDate = DateTimeHelper.SaNow;

                                    _policyDetailRepository.Update(policyDetail, true);
                                }
                                else
                                {
                                    _policyDetailRepository.Create(new policy_PolicyDetail
                                    {
                                        PolicyId = policyDetail.PolicyId,
                                        PolicyAdministratorId = groupRiskPolicy.AdministratorId,
                                        PolicyConsultantId = groupRiskPolicy.RmaRelationshipManagerId,
                                        PolicyAnniversaryMonth = (byte)groupRiskPolicy.AnniversaryMonthTypeId,
                                        PaymentFrequency = (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId,
                                        EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                                        NextReviewDate = groupRiskPolicy.NextRateReviewDate.HasValue ? groupRiskPolicy.NextRateReviewDate.Value.Date : groupRiskPolicy.NextRateReviewDate,
                                        LastReviewDate = groupRiskPolicy.LastRateUpdateDate.HasValue ? groupRiskPolicy.LastRateUpdateDate.Value.Date : groupRiskPolicy.LastRateUpdateDate,
                                        PolicyHolderId = groupRiskPolicy.FundRolePlayerId,
                                        PolicyName = groupRiskPolicy.ClientReference,
                                        CreatedBy = RmaIdentity.Username,
                                        CreatedDate = DateTimeHelper.SaNow,
                                        ModifiedBy = RmaIdentity.Username,
                                        ModifiedDate = DateTimeHelper.SaNow,
                                    }, true);
                                }
                            }
                        }


                        var existingBrokers = await _policyBrokerRepository.Where(x => x.PolicyId == groupRiskPolicy.PolicyId)
                                                                           .ToListAsync();
                        var existingBroker = existingBrokers.Find(x => x.EffectiveDate.Date == groupRiskPolicy.NewEffectiveDate.Date) ??
                                             existingBrokers.Find(x => x.EffectiveDate < groupRiskPolicy.NewEffectiveDate.Date);

                        if (existingBroker != null)
                        {
                            if (IsBrokerageChanged(existingBroker, groupRiskPolicy))
                            {
                                if (existingBroker.EffectiveDate.Date == groupRiskPolicy.NewEffectiveDate.Date)
                                {
                                    existingBroker.BrokerageId = groupRiskPolicy.BrokerageId;
                                    existingBroker.RepId = _groupRiskDummyRepresentativeId;
                                    existingBroker.ModifiedBy = RmaIdentity.Username;
                                    existingBroker.ModifiedDate = DateTimeHelper.SaNow;
                                    _policyBrokerRepository.Update(existingBroker, true);
                                }

                                else
                                {
                                    _policyBrokerRepository.Create(new policy_PolicyBroker
                                    {
                                        PolicyId = groupRiskPolicy.PolicyId,
                                        BrokerageId = groupRiskPolicy.BrokerageId,
                                        RepId = _groupRiskDummyRepresentativeId,
                                        EffectiveDate = DateTimeHelper.StartOfTheMonth(groupRiskPolicy.NewEffectiveDate),
                                        CreatedDate = DateTimeHelper.SaNow,
                                        CreatedBy = RmaIdentity.Username,
                                        ModifiedDate = DateTimeHelper.SaNow,
                                        ModifiedBy = RmaIdentity.Username
                                    }, true);
                                }
                            }
                        }


                        var existingTreaties = await _policyTreatyRepository.Where(x => x.PolicyId == groupRiskPolicy.PolicyId)
                                                                            .ToListAsync();
                        var existingTreaty = existingTreaties.Find(x => x.EffectiveDate.Date == groupRiskPolicy.NewEffectiveDate.Date) ??
                                             existingTreaties.Find(x => x.EffectiveDate.Date < groupRiskPolicy.NewEffectiveDate.Date);
                        if (existingTreaty != null)
                        {
                            if (IsReinsuranceTreatyChanged(existingTreaty, groupRiskPolicy))
                            {
                                if (existingTreaty.EffectiveDate.Date == groupRiskPolicy.NewEffectiveDate.Date)
                                {
                                    existingTreaty.TreatyId = groupRiskPolicy.ReinsuranceTreatyId;
                                    existingTreaty.ModifiedBy = RmaIdentity.Username;
                                    existingTreaty.ModifiedDate = DateTimeHelper.SaNow;
                                    _policyTreatyRepository.Update(existingTreaty, true);
                                }
                                else
                                {
                                    _policyTreatyRepository.Create(new policy_PolicyTreaty
                                    {
                                        PolicyId = groupRiskPolicy.PolicyId,
                                        TreatyId = groupRiskPolicy.ReinsuranceTreatyId,
                                        EffectiveDate = groupRiskPolicy.NewEffectiveDate.Date,
                                        CreatedBy = RmaIdentity.Username,
                                        CreatedDate = DateTimeHelper.SaNow,
                                        ModifiedBy = RmaIdentity.Username,
                                        ModifiedDate = DateTimeHelper.SaNow
                                    }, true);
                                }

                            }
                        }

                        var policyEntity = await _policyRepository.Where(x => x.PolicyId == groupRiskPolicy.PolicyId)
                                                                  .FirstOrDefaultAsync();
                        if (policyEntity != null)
                        {
                            if (IsPolicyChanged(policyEntity, groupRiskPolicy))
                            {
                                policyEntity.BrokerageId = groupRiskPolicy.BrokerageId;
                                policyEntity.PaymentFrequency = (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId;
                                policyEntity.PolicyStatus = (PolicyStatusEnum)groupRiskPolicy.SchemeStatusId;
                                policyEntity.ModifiedBy = RmaIdentity.Username;
                                policyEntity.ModifiedDate = DateTimeHelper.SaNow;
                                policyEntity.ExpiryDate = groupRiskPolicy.EndDate.HasValue ? DateTimeHelper.EndOfTheMonth(groupRiskPolicy.EndDate.Value) : groupRiskPolicy.EndDate;
                                _policyRepository.Update(policyEntity, true);
                            }

                        }

                        foreach (var policyBenefit in groupRiskPolicy.GroupRiskPolicyBenefits)
                        {

                            List<policy_PolicyBenefitDetail> benefitDetails = await _policyBenefitDetailRepository.Where(x => x.PolicyId == policyBenefit.PolicyId && x.BenefitId == policyBenefit.BenefitId)
                                                                                                                  .ToListAsync();

                            var existingBenefitDetail = benefitDetails.Find(x => x.StartDate.Date == policyBenefit.NewEffectiveDate.Date) ??
                                                        benefitDetails.Find(x => x.StartDate.Date < policyBenefit.NewEffectiveDate.Date);
                            if (existingBenefitDetail != null)
                            {
                                if (IsBenefitDetailChanged(existingBenefitDetail, policyBenefit))
                                {
                                    if (existingBenefitDetail.StartDate.Date == policyBenefit.NewEffectiveDate.Date)
                                    {
                                        existingBenefitDetail.EndDate = policyBenefit.EndDate;
                                        existingBenefitDetail.ModifiedBy = RmaIdentity.Username;
                                        existingBenefitDetail.ModifiedDate = DateTimeHelper.SaNow;

                                        _policyBenefitDetailRepository.Update(existingBenefitDetail, true);
                                    }
                                    else
                                    {
                                        _policyBenefitDetailRepository.Create(new policy_PolicyBenefitDetail
                                        {
                                            PolicyId = existingBenefitDetail.PolicyId,
                                            BenefitId = existingBenefitDetail.BenefitId,
                                            EndDate = policyBenefit.EndDate,
                                            CreatedBy = RmaIdentity.Username,
                                            CreatedDate = DateTimeHelper.SaNow,
                                            ModifiedBy = RmaIdentity.Username,
                                            ModifiedDate = DateTimeHelper.SaNow,
                                        }, true);

                                    }
                                }
                            }


                            List<policy_PolicyBenefitOption> benefitOptions = await _policyBenefitOptionRepository.Where(x => x.BenefitDetailId == policyBenefit.BenefitDetailId).ToListAsync();
                            await _policyBenefitOptionRepository.LoadAsync(benefitOptions, x => x.BenefitOptionItemValue);
                            await _productBenefitOptionItemValueRepository.LoadAsync(benefitOptions.Select(x => x.BenefitOptionItemValue), x => x.OptionItem);

                            foreach (var benefitOption in policyBenefit.BenefitOptions)
                            {
                                var dbOption = benefitOptions.Find(x => x.BenefitOptionId == benefitOption.BenefitOptionId);
                                if(dbOption != null)
                                {
                                    if (IsBenefitOptionChanged(dbOption, benefitOption))
                                    {
                                        int optionTypeId = dbOption.BenefitOptionItemValue.OptionItem.OptionTypeId;
                                        var existingBenefitOption = benefitOptions.First(x => x.EffectiveDate.Date == policyBenefit.NewEffectiveDate.Date &&
                                                                                              x.BenefitOptionItemValue != null &&
                                                                                              x.BenefitOptionItemValue.OptionItem.OptionTypeId == optionTypeId);
                                        if (existingBenefitOption != null)
                                        {

                                            existingBenefitOption.BenefitOptionItemValueId = benefitOption.BenefitOptionItemValueId;
                                            existingBenefitOption.OverrideValue = benefitOption.OverrideValue;
                                            existingBenefitOption.ModifiedBy = RmaIdentity.Username;
                                            existingBenefitOption.ModifiedDate = DateTimeHelper.SaNow;
                                            _policyBenefitOptionRepository.Update(existingBenefitOption, true);
                                        }
                                        else
                                        {
                                            _policyBenefitOptionRepository.Create(new policy_PolicyBenefitOption
                                            {
                                                BenefitDetailId = benefitOption.BenefitDetailId,
                                                BenefitOptionItemValueId = benefitOption.BenefitOptionItemValueId,
                                                EffectiveDate = DateTimeHelper.StartOfTheMonth(policyBenefit.NewEffectiveDate).Date,
                                                OverrideValue = benefitOption.OverrideValue,
                                                CreatedBy = RmaIdentity.Username,
                                                CreatedDate = DateTimeHelper.SaNow,
                                            }, true);
                                        }
                                    }
                                }

                            }


                            List<policy_PolicyBenefitCategory> benefitCategories = await _policyBenefitCategoryRepository.Where(x => x.BenefitDetailId == policyBenefit.BenefitDetailId).ToListAsync();

                            foreach (var benefitCategory  in policyBenefit.BenefitCategories)
                            {
                                var dbCategory = benefitCategories.Find(x => x.BenefitCategoryId == benefitCategory.BenefitCategoryId);
                                if(dbCategory != null)
                                {
                                    if (dbCategory.BenefitCategoryId == benefitCategory.BenefitCategoryId)
                                    {
                                        if (IsBenefitCategoryChanged(dbCategory, benefitCategory))
                                        {
                                            dbCategory.Name = benefitCategory.Name;
                                            dbCategory.Description = benefitCategory.CategoryDescription;
                                            dbCategory.EndDate = benefitCategory.EndDate.HasValue ? benefitCategory.EndDate.Value.Date : benefitCategory.EndDate;
                                            dbCategory.ModifiedBy = RmaIdentity.Username;
                                            dbCategory.ModifiedDate = DateTimeHelper.SaNow;

                                            _policyBenefitCategoryRepository.Update(dbCategory, true);
                                        }

                                    }
                                }
                                
                                List<policy_BenefitCategoryOption> categoryOptions = await _policyBenefitCategoryOptionRepository.Where(x => x.BenefitCategoryId == benefitCategory.BenefitCategoryId).ToListAsync();
                                await _policyBenefitCategoryOptionRepository.LoadAsync(categoryOptions, x => x.BenefitOptionItemValue);
                                await _productBenefitOptionItemValueRepository.LoadAsync(categoryOptions.Select(x => x.BenefitOptionItemValue), x => x.OptionItem);
                                foreach (var categoryOption in benefitCategory.CategoryOptions)
                                {
                                    var dbOption = categoryOptions.Find(x => x.CategoryOptionId == categoryOption.CategoryOptionId);
                                    if(dbOption != null)
                                    {
                                        if (IsCategoryOptionChanged(dbOption, categoryOption))
                                        {
                                            var optionTypeId = dbOption.BenefitOptionItemValue.OptionItem.OptionTypeId;
                                            var existingCategoryOption = categoryOptions.FirstOrDefault(x => x.EffectiveDate.Date == benefitCategory.NewEffectiveDate.Date &&
                                                                                                             x.BenefitOptionItemValue != null &&
                                                                                                             x.BenefitOptionItemValue.OptionItem.OptionTypeId == optionTypeId);
                                            if (existingCategoryOption != null)
                                            {
                                                existingCategoryOption.BenefitOptionItemValueId = categoryOption.BenefitOptionItemValueId;
                                                existingCategoryOption.OverrideValue = categoryOption.OverrideValue;
                                                existingCategoryOption.ModifiedDate = DateTimeHelper.SaNow;
                                                existingCategoryOption.ModifiedBy = RmaIdentity.Username;
                                                _policyBenefitCategoryOptionRepository.Update(existingCategoryOption, true);

                                            }
                                            else
                                            {
                                                _policyBenefitCategoryOptionRepository.Create(new policy_BenefitCategoryOption
                                                {
                                                    BenefitCategoryId = categoryOption.BenefitCategoryId,
                                                    BenefitOptionItemValueId = categoryOption.BenefitOptionItemValueId,
                                                    EffectiveDate = DateTimeHelper.StartOfTheMonth(benefitCategory.NewEffectiveDate).Date,
                                                    CreatedBy = RmaIdentity.Username,
                                                    CreatedDate = DateTimeHelper.SaNow,
                                                    ModifiedBy = RmaIdentity.Username,
                                                    ModifiedDate = DateTimeHelper.SaNow
                                                }, true);

                                            }
                                        }
                                    }
                                }

                                List<policy_BenefitCategoryExtension> categoryExtensions = await _policyBenefitCategoryExtensionRepository.Where(x => x.BenefitCategoryId == benefitCategory.BenefitCategoryId).ToListAsync();
                                var categoryExtension = categoryExtensions.FirstOrDefault(x => x.EffectiveDate.Date == benefitCategory.NewEffectiveDate.Date) ??
                                                        categoryExtensions.FirstOrDefault(x => x.EffectiveDate.Date < benefitCategory.NewEffectiveDate.Date);
                                if (categoryExtension != null)
                                {
                                    if (IsCategoryExtensionChanged(categoryExtension, benefitCategory))
                                    {
                                        if (categoryExtension.EffectiveDate.Date == benefitCategory.NewEffectiveDate.Date)
                                        {
                                            categoryExtension.FlatCoverAmount = benefitCategory.FlatCoverAmount;
                                            categoryExtension.SalaryMultiple = benefitCategory.SalaryMultiple;
                                            categoryExtension.WaiverPercentage = benefitCategory.EmployerWaiver;
                                            categoryExtension.FuneralCoverTypeId = benefitCategory.FuneralCoverTypeId.HasValue ? (int?)benefitCategory.FuneralCoverTypeId : null;
                                            categoryExtension.ModifiedBy = RmaIdentity.Username;
                                            categoryExtension.ModifiedDate = DateTimeHelper.SaNow;
                                            _policyBenefitCategoryExtensionRepository.Update(categoryExtension, true);
                                        }
                                        else
                                        {
                                            _policyBenefitCategoryExtensionRepository.Create(new policy_BenefitCategoryExtension
                                            {
                                                BenefitCategoryId = benefitCategory.BenefitCategoryId,
                                                EffectiveDate = DateTimeHelper.StartOfTheMonth(benefitCategory.NewEffectiveDate).Date,
                                                IsCategoryBilling = false,
                                                FlatCoverAmount = benefitCategory.FlatCoverAmount,
                                                SalaryMultiple = benefitCategory.SalaryMultiple,
                                                WaiverPercentage = benefitCategory.EmployerWaiver,
                                                CreatedBy = RmaIdentity.Username,
                                                CreatedDate = DateTimeHelper.SaNow,
                                                ModifiedBy = RmaIdentity.Username,
                                                ModifiedDate = DateTimeHelper.SaNow
                                            }, true);
                                        }

                                    }
                                }
  
                                if (benefitCategory.FuneralCoverTypeId == FuneralCoverTypeEnum.CustomScale)
                                {
                                    List<policy_BenefitCategoryFuneral> benefitCategoryFuneralScales = await _BenefitCategoryFuneralRepository.Where(x => x.BenefitCategoryId == benefitCategory.BenefitCategoryId)
                                                                                                                                                                  .ToListAsync();
                                    foreach (var funeralScale in benefitCategory.FuneralScales)
                                    {
                                        var existingFuneralScale = benefitCategoryFuneralScales.Find(x => x.BenefitCategoryId == funeralScale.BenefitCategoryId && x.EffectiveDate.Date == funeralScale.EffectiveDate.Date
                                                                                                                && x.FuneralInsuredTypeId == funeralScale.FuneralInsuredTypeId);
                                        if (existingFuneralScale != null)
                                        {
                                            if (IsBenefitCategoryFuneralChanged(existingFuneralScale, funeralScale))
                                            {
                                                existingFuneralScale.ModifiedBy = RmaIdentity.Username;
                                                existingFuneralScale.ModifiedDate = DateTimeHelper.SaNow;
                                                existingFuneralScale.CoverAmount = funeralScale.CoverAmount;
                                                _BenefitCategoryFuneralRepository.Update(existingFuneralScale, true);
                                            }
                                        }

                                        if (funeralScale.BenefitCategoryId == 0 && benefitCategory.BenefitCategoryId > 0)
                                        {
                                            _BenefitCategoryFuneralRepository.Create(new policy_BenefitCategoryFuneral
                                            {
                                                BenefitCategoryId = benefitCategory.BenefitCategoryId,
                                                EffectiveDate = DateTimeHelper.StartOfTheMonth(funeralScale.EffectiveDate),
                                                FuneralInsuredTypeId = funeralScale.FuneralInsuredTypeId,
                                                CoverAmount = funeralScale.CoverAmount,
                                                IsDeleted = false,
                                                CreatedBy = RmaIdentity.Username,
                                                CreatedDate = DateTimeHelper.SaNow,
                                                ModifiedBy = RmaIdentity.Username,
                                                ModifiedDate = DateTimeHelper.SaNow
                                            }, true);
                                        }
                                    }

                                    var deletedList = benefitCategoryFuneralScales.Where(x => !benefitCategory.FuneralScales.Any(s => s.BenefitCategoryId == x.BenefitCategoryId && s.EffectiveDate.Date == x.EffectiveDate.Date
                                                                                                                                    && s.FuneralInsuredTypeId == x.FuneralInsuredTypeId));
                                    foreach (var deletedItem in deletedList)
                                    {
                                        deletedItem.ModifiedBy = RmaIdentity.Username;
                                        deletedItem.ModifiedDate = DateTimeHelper.SaNow;
                                        _BenefitCategoryFuneralRepository.Delete(deletedItem);
                                    }
                                }
                            }

                            //insert new entries
                            if (policyBenefit.BenefitDetailId == 0)
                            {
                                var newBenefitWithOptions = GetPolicyBenefitDBModel(policyBenefit);
                                SqlParameter[] parameters = {
                                    new SqlParameter("policyId", groupRiskPolicy.PolicyId),
                                    new SqlParameter("benefitId", policyBenefit.BenefitId)
                                };

                                await _policyRepository.ExecuteSqlCommandAsync(DatabaseConstants.InsertPolicyBenefit, parameters);
                                _policyBenefitOptionRepository.Create(newBenefitWithOptions, true);
                            }
                            if (policyBenefit.BenefitDetailId > 0)
                            {

                                var categoryList = policyBenefit.BenefitCategories.FindAll(x => x.BenefitCategoryId == 0);
                                if (categoryList.Any())
                                {
                                    var dbCategoryOptions = GetBenefitCategoriesForBenefit(categoryList, policyBenefit.BenefitDetailId);
                                    _policyBenefitCategoryRepository.Create(dbCategoryOptions, true);
                                }
                                
                            }

                        }
                    }
                    _ = await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return true;
            }
            catch (Exception ex)
            {
                ex.LogException();
                throw new BusinessException("Error occured while trying to update policies");
            }
        }

        private List<policy_PolicyBenefitOption> GetPolicyBenefitDBModel(GroupRiskPolicyBenefit policyBenefit)
        {

            //add category
            var benefitCategories = GetBenefitCategoriesForBenefit(policyBenefit.BenefitCategories);
            var policyBenefitDetail = new policy_PolicyBenefitDetail
            {
                PolicyId = policyBenefit.PolicyId,
                BenefitId = policyBenefit.BenefitId,
                StartDate = DateTimeHelper.StartOfTheMonth(policyBenefit.NewEffectiveDate),
                EndDate = policyBenefit.EndDate.HasValue ? DateTimeHelper.EndOfTheMonth(policyBenefit.EndDate.Value.Date) : policyBenefit.EndDate,
                PolicyBenefitCategories = benefitCategories,
                CreatedBy = RmaIdentity.Username,
                CreatedDate = DateTimeHelper.SaNow,
                ModifiedBy = RmaIdentity.Username,
                ModifiedDate = DateTimeHelper.SaNow
            };


            List<policy_PolicyBenefitOption> benefitOptions = new List<policy_PolicyBenefitOption>();
            foreach (var benefitOption in policyBenefit.BenefitOptions)
            {
                benefitOptions.Add(new policy_PolicyBenefitOption
                {
                    BenefitOptionItemValueId = benefitOption.BenefitOptionItemValueId,
                    PolicyBenefitDetail = policyBenefitDetail,
                    EffectiveDate = DateTimeHelper.StartOfTheMonth(policyBenefit.NewEffectiveDate),
                    OverrideValue = benefitOption.OverrideValue,
                    IsDeleted = false,
                    CreatedBy = RmaIdentity.Username,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = RmaIdentity.Username,
                    ModifiedDate = DateTimeHelper.SaNow
                });
            }



            return benefitOptions;

        }

        private bool IsBenefitCategoryFuneralChanged(policy_BenefitCategoryFuneral benefitCategoryFuneral, BenefitCategoryFuneral funeralScale)
        {
            if (benefitCategoryFuneral.CoverAmount != funeralScale.CoverAmount)
                return true;
            return false;
        }

        private bool IsCategoryExtensionChanged(policy_BenefitCategoryExtension categoryExtension, GroupRiskPolicyBenefitCategory benefitCategory)
        {
            if (categoryExtension.FlatCoverAmount != benefitCategory.FlatCoverAmount ||
                categoryExtension.SalaryMultiple != benefitCategory.SalaryMultiple ||
                categoryExtension.WaiverPercentage != benefitCategory.EmployerWaiver ||
                categoryExtension.FuneralCoverTypeId != (int?)benefitCategory.FuneralCoverTypeId)
                return true;
            return false;
        }

        private bool IsCategoryOptionChanged(policy_BenefitCategoryOption dbOption, PolicyBenefitCategoryOption categoryOption)
        {
            if (dbOption.BenefitOptionItemValueId != categoryOption.BenefitOptionItemValueId ||
                dbOption.EffectiveDate.Date != categoryOption.EffectiveDate.Date ||
                dbOption.OverrideValue != categoryOption.OverrideValue)
                return true;
            return false;
        }

        private bool IsBenefitCategoryChanged(policy_PolicyBenefitCategory dbCategory, GroupRiskPolicyBenefitCategory benefitCategory)
        {
            if (!dbCategory.Name.Equals(benefitCategory.Name) ||
                !dbCategory.Description.Equals(benefitCategory.CategoryDescription) ||
                dbCategory.StartDate != benefitCategory.StartDate.Date ||
                dbCategory.EndDate != benefitCategory.EndDate)
                return true;

            return false;
        }

        private bool IsBenefitDetailChanged(policy_PolicyBenefitDetail benefitDetail, GroupRiskPolicyBenefit policyBenefit)
        {
            if (benefitDetail.EndDate != policyBenefit.EndDate)
                return true;
            return false;
        }

        private bool IsBenefitOptionChanged(policy_PolicyBenefitOption dbOption, PolicyBenefitOption benefitOption)
        {
            if (dbOption.BenefitOptionItemValueId != benefitOption.BenefitOptionItemValueId || dbOption.OverrideValue != benefitOption.OverrideValue
                || dbOption.EffectiveDate.Date != benefitOption.EffectiveDate.Date)
                return true;

            return false;
        }

        private bool IsReinsuranceTreatyChanged(policy_PolicyTreaty policyTreaty, GroupRiskPolicy groupRiskPolicy)
        {
            if (policyTreaty.TreatyId != groupRiskPolicy.ReinsuranceTreatyId)
                return true;

            return false;
        }

        private bool IsBrokerageChanged(policy_PolicyBroker policyBroker, GroupRiskPolicy groupRiskPolicy)
        {
            if (policyBroker.BrokerageId != groupRiskPolicy.BrokerageId)
                return true;

            return false;
        }

        private bool IsPolicyDetailsChanged(policy_PolicyDetail policyDetail, GroupRiskPolicy groupRiskPolicy)
        {
            if (policyDetail.PolicyAdministratorId != groupRiskPolicy.AdministratorId ||
               policyDetail.PolicyConsultantId != groupRiskPolicy.RmaRelationshipManagerId ||
               policyDetail.PolicyAnniversaryMonth != (byte)groupRiskPolicy.AnniversaryMonthTypeId ||
               policyDetail.PaymentFrequency != (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId ||
               policyDetail.NextReviewDate != (groupRiskPolicy.NextRateReviewDate.HasValue ? groupRiskPolicy.NextRateReviewDate.Value.Date : groupRiskPolicy.NextRateReviewDate) ||
               policyDetail.LastReviewDate != (groupRiskPolicy.LastRateUpdateDate.HasValue ? groupRiskPolicy.LastRateUpdateDate.Value.Date : groupRiskPolicy.LastRateUpdateDate) ||
               policyDetail.PolicyHolderId != groupRiskPolicy.FundRolePlayerId ||
               !string.Equals(policyDetail.PolicyName, groupRiskPolicy.ClientReference, StringComparison.InvariantCultureIgnoreCase))
                return true;

            return false;
        }

        private bool IsPolicyChanged(policy_Policy policy, GroupRiskPolicy groupRiskPolicy)
        {
            if (policy.BrokerageId != groupRiskPolicy.BrokerageId ||
               policy.PaymentFrequency != (PaymentFrequencyEnum)groupRiskPolicy.BillingFrequencyTypeId ||
               policy.PolicyStatus != (PolicyStatusEnum)groupRiskPolicy.SchemeStatusId ||
               policy.ExpiryDate != (groupRiskPolicy.EndDate.HasValue ? DateTimeHelper.EndOfTheMonth(groupRiskPolicy.EndDate.Value) : groupRiskPolicy.EndDate))
                return true;


            return false;
        }

        private bool IsPolicyOptionChanged(policy_PolicyOption dbPolicyOption, PolicyOption policyOption)
        {
            if (dbPolicyOption.ProductOptionOptionItemValueId != policyOption.ProductOptionOptionItemValueId ||
                dbPolicyOption.OverrideValue != policyOption.OverrideValue)
                return true;
            return false;
        }

        public async Task<GroupRiskCaseModel> GetSchemePoliciesByEmployerRolePlayerId(int employerRolePlayerId)
        {
            var groupRiskCaseModel = new GroupRiskCaseModel();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {

                var policies = await _policyRepository.Where(x => x.PolicyOwnerId == employerRolePlayerId && x.ProductOption.Product.ProductClass == ProductClassEnum.GroupRisk).ToListAsync();
                foreach (var policy in policies)
                {
                    await _policyRepository.LoadAsync(policy, x => x.PolicyDetails);
                    await _policyRepository.LoadAsync(policy, x => x.PolicyBinders);
                    await _policyRepository.LoadAsync(policy, x => x.PolicyOptions);
                    await _policyRepository.LoadAsync(policy, x => x.ProductOption);
                    await _policyRepository.LoadAsync(policy, x => x.PolicyTreaties);
                    await _policyTreatyRepository.LoadAsync(policy.PolicyTreaties, x => x.Treaty);

                    groupRiskCaseModel.GroupRiskPolicies.Add(await GetGroupRiskPolicyWithDetails(policy, true, true));
                }
                groupRiskCaseModel.EmployerRolePlayerId = employerRolePlayerId;

                return groupRiskCaseModel;
            }
        }

        public async Task<GroupRiskPolicy> GetGroupRiskPolicy(int policyId, DateTime effectiveDate)
        {
            return await GetGroupRiskPolicyWithDetails(policyId, effectiveDate);
        }

        public async Task<GroupRiskPolicyBenefit> GetGroupRiskPolicyBenefit(int benefitDetailId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyBenefitDetails = await _policyBenefitDetailRepository.Where(b => b.BenefitDetailId == benefitDetailId)
                                                                                      .ToListAsync();
                var policyBenefits = await GetGroupRiskPolicyBenefits(policyBenefitDetails, effectiveDate, false);
                return policyBenefits.Any() ? policyBenefits.First() : new GroupRiskPolicyBenefit();
            }
        }

        public async Task<GroupRiskPolicyBenefitCategory> GroupRiskPolicyBenefitCategory(int benefitCategoryId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyCategory = await _policyBenefitCategoryRepository.Where(x => x.BenefitCategoryId == benefitCategoryId).FirstOrDefaultAsync();
                if (policyCategory != null)
                {
                    var benefitDetail = await _policyBenefitDetailRepository.Where(x => x.BenefitDetailId == policyCategory.BenefitDetailId).ToListAsync();
                    var categories = await GetGroupRiskPolicyBenefitCategories(benefitDetail, effectiveDate);
                    var category = categories.FirstOrDefault(x => x.BenefitCategoryId == benefitCategoryId);
                    if (category != null)
                        return category;

                }

                return new GroupRiskPolicyBenefitCategory();

            }
        }

        private async Task<List<GroupRiskPolicyBenefit>> GetGroupRiskPolicyBenefits(List<policy_PolicyBenefitDetail> policyBenefitDetails, DateTime? effectiveDate, bool isRetrieveCategories = false)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitIds = policyBenefitDetails.Select(s => s.BenefitId).ToList();
                var benefits = await _benefitRepository.Where(x => benefitIds.Contains(x.Id)).ToListAsync();
                List<GroupRiskPolicyBenefit> groupRiskPolicyBenefits = new List<GroupRiskPolicyBenefit>();
                foreach (var policyBenefit in policyBenefitDetails)
                {
                    foreach (var benefit in benefits)
                    {
                        if (policyBenefit.BenefitId == benefit.Id)
                        {
                            var benefitDetailDates = await GetPolicyBenefitDetailsEffectiveDates(policyBenefit.PolicyId, policyBenefit.BenefitId);
                            var detailsEffectiveDate = benefitDetailDates.OrderByDescending(x => x).First();
                            var benefitOptions = await _policyBenefitOptionRepository.Where(bo => bo.PolicyBenefitDetail.PolicyId == policyBenefit.PolicyId && bo.PolicyBenefitDetail.BenefitId == policyBenefit.BenefitId &&
                                                                                          bo.EffectiveDate <= (effectiveDate ?? detailsEffectiveDate))
                                                                             .GroupBy(g => g.BenefitOptionItemValue.OptionItem.OptionTypeId)
                                                                             .Select(gr => gr.Select(s => s)
                                                                                             .OrderByDescending(o => o.EffectiveDate)
                                                                                             .FirstOrDefault())
                                                                             .ToListAsync();

                            await _policyBenefitOptionRepository.LoadAsync(benefitOptions, x => x.BenefitOptionItemValue);
                            await _productBenefitOptionItemValueRepository.LoadAsync(benefitOptions.Select(x => x.BenefitOptionItemValue), x => x.OptionItem);
                            policyBenefit.PolicyBenefitOptions = benefitOptions;

                            groupRiskPolicyBenefits.Add(await GetGroupRiskPolicyBenefitModelAsync(policyBenefit, benefit, benefitDetailDates));
                        }

                    }

                    if (isRetrieveCategories)
                    {
                        var benefit = groupRiskPolicyBenefits.Find(x => x.BenefitDetailId == policyBenefit.BenefitDetailId);
                        benefit.BenefitCategories.AddRange(await GetGroupRiskPolicyBenefitCategories(new List<policy_PolicyBenefitDetail>() { policyBenefit }, effectiveDate));
                    }
                }

                return groupRiskPolicyBenefits;
            }
        }
        private async Task<List<GroupRiskPolicyBenefitCategory>> GetGroupRiskPolicyBenefitCategories(List<policy_PolicyBenefitDetail> policyBenefitDetails, DateTime? effectiveDate)
        {
            List<GroupRiskPolicyBenefitCategory> categories = new List<GroupRiskPolicyBenefitCategory>();
            foreach (var policyBenefit in policyBenefitDetails)
            {
                var benefitCategories = await _policyBenefitCategoryRepository.Where(bc => bc.PolicyBenefitDetail.PolicyId == policyBenefit.PolicyId && bc.PolicyBenefitDetail.BenefitId == policyBenefit.BenefitId)
                                                                              .ToListAsync();

                await _policyBenefitCategoryRepository.LoadAsync(benefitCategories, x => x.BenefitCategoryExtensions);
                await _policyBenefitCategoryRepository.LoadAsync(benefitCategories, x => x.BenefitCategoryFunerals);

                foreach (var benefitCategory in benefitCategories)
                {
                    var categoryDetailDates = await GetBenefitCategoryDetailsEffectiveDates(policyBenefit.PolicyId, policyBenefit.BenefitId, benefitCategory.BenefitCategoryId);
                    var categoryEffectiveDate = categoryDetailDates.OrderByDescending(x => x).FirstOrDefault();
                    var categoryOptions = await _policyBenefitCategoryOptionRepository.Where(x => x.BenefitCategoryId == benefitCategory.BenefitCategoryId &&
                                                                                                  x.EffectiveDate <= (effectiveDate ?? categoryEffectiveDate))
                                                                                      .GroupBy(g => g.BenefitOptionItemValue.OptionItem.OptionTypeId)
                                                                                      .Select(gr => gr.Select(s => s)
                                                                                                      .OrderByDescending(o => o.EffectiveDate)
                                                                                                      .FirstOrDefault())
                                                                                      .ToListAsync();
                    await _policyBenefitCategoryOptionRepository.LoadAsync(categoryOptions, x => x.BenefitOptionItemValue);
                    var benefitCategoryOptions = new List<PolicyBenefitCategoryOption>();
                    foreach (var categoryOption in categoryOptions)
                    {
                        benefitCategoryOptions.Add(new PolicyBenefitCategoryOption
                        {
                            CategoryOptionId = categoryOption.CategoryOptionId,
                            BenefitCategoryId = categoryOption.BenefitCategoryId,
                            BenefitOptionItemValueId = categoryOption.BenefitOptionItemValueId,
                            OverrideValue = categoryOption.OverrideValue,
                            EffectiveDate = categoryOption.EffectiveDate,
                            OptionItemField = categoryOption.BenefitOptionItemValue.OptionItemField
                        });
                    }

                    var categoryExtension = benefitCategory.BenefitCategoryExtensions.Where(x => x.BenefitCategoryId == benefitCategory.BenefitCategoryId &&
                                                                                                 x.EffectiveDate <= (effectiveDate ?? categoryEffectiveDate))
                                                                                     .GroupBy(g => g.BenefitCategoryId)
                                                                                     .Select(gr => gr.Select(s => s)
                                                                                                     .OrderByDescending(o => o.EffectiveDate)
                                                                                                     .FirstOrDefault())
                                                                                     .FirstOrDefault();
                    var funeralScales = new List<BenefitCategoryFuneral>();
                    foreach (var funeralScale in benefitCategory.BenefitCategoryFunerals.ToList())
                    {
                        funeralScales.Add(new BenefitCategoryFuneral
                        {
                            BenefitCategoryId = funeralScale.BenefitCategoryId,
                            EffectiveDate = funeralScale.EffectiveDate,
                            FuneralInsuredTypeId = funeralScale.FuneralInsuredTypeId,
                            CoverAmount = funeralScale.CoverAmount
                        });
                    }

                    categories.Add(new GroupRiskPolicyBenefitCategory
                    {
                        BenefitId = policyBenefit.BenefitId,
                        StartDate = benefitCategory.StartDate,
                        EndDate = benefitCategory.EndDate,
                        NewEffectiveDate = categoryDetailDates.Where(x => x.Date <= (effectiveDate?.Date ?? categoryEffectiveDate.Date)).OrderByDescending(o => o).FirstOrDefault(),
                        CategoryDescription = benefitCategory.Description,
                        Name = benefitCategory.Name,
                        FlatCoverAmount = categoryExtension?.FlatCoverAmount ?? 0,
                        EmployerWaiver = categoryExtension?.WaiverPercentage ?? 0,
                        SalaryMultiple = categoryExtension?.SalaryMultiple ?? 0,
                        FuneralCoverTypeId = (FuneralCoverTypeEnum?)categoryExtension?.FuneralCoverTypeId,
                        PolicyId = policyBenefit.PolicyId,
                        CategoryOptions = benefitCategoryOptions,
                        BenefitCategoryId = benefitCategory.BenefitCategoryId,
                        CategoryDetailsEffectiveDates = categoryDetailDates,
                        FuneralScales = categoryExtension?.FuneralCoverTypeId == (int)FuneralCoverTypeEnum.CustomScale ? funeralScales : null
                    });

                }
            }


            return categories;

        }
        private List<DateTime> GetPolicyDetailsEffectiveDates(policy_Policy policy)
        {
            var policyDetailsDates = new List<DateTime>();
            policyDetailsDates.AddRange(policy.PolicyTreaties.Select(x => x.EffectiveDate).ToList());
            policyDetailsDates.AddRange(policy.PolicyDetails.Select(x => x.EffectiveDate).ToList());
            policyDetailsDates.AddRange(policy.PolicyBinders.Select(x => x.EffectiveDate).ToList());
            policyDetailsDates.AddRange(policy.PolicyOptions.Select(x => x.EffectiveDate).ToList());

            return policyDetailsDates.Distinct().ToList();
        }

        private async Task<List<DateTime>> GetPolicyBenefitDetailsEffectiveDates(int policyId, int benefitId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitDetails = await _policyBenefitDetailRepository.Where(x => x.PolicyId == policyId && x.BenefitId == benefitId).ToListAsync();
                await _policyBenefitDetailRepository.LoadAsync(benefitDetails, x => x.PolicyBenefitOptions);
                List<DateTime> effectiveDates = new List<DateTime>();
                effectiveDates.AddRange(benefitDetails.Select(x => x.StartDate).ToList());
                var optionsEffectiveDates = benefitDetails.SelectMany(x => x.PolicyBenefitOptions, (d, o) => o.EffectiveDate).ToList();

                effectiveDates.AddRange(optionsEffectiveDates);

                return effectiveDates.Distinct().ToList();
            }
        }

        private async Task<List<DateTime>> GetBenefitCategoryDetailsEffectiveDates(int policyId, int benefitId, int benefitCategoryId = 0)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<DateTime> categoryExtensionDates = new List<DateTime>();
                List<DateTime> categoryDetailDates = new List<DateTime>();
                List<DateTime> categoryOptionDates = new List<DateTime>();
                var benefitCategories = await _policyBenefitCategoryRepository.Where(x => x.PolicyBenefitDetail.PolicyId == policyId && x.PolicyBenefitDetail.BenefitId == benefitId).ToListAsync();
                await _policyBenefitCategoryRepository.LoadAsync(benefitCategories, x => x.BenefitCategoryOptions);
                if (benefitCategoryId > 0)
                {
                    categoryExtensionDates = benefitCategories.Where(x => x.BenefitCategoryId == benefitCategoryId)
                                                              .SelectMany(c => c.BenefitCategoryExtensions, (c, o) => o.EffectiveDate)
                                                              .ToList();
                    categoryDetailDates = benefitCategories.Where(x => x.BenefitCategoryId == benefitCategoryId)
                                                           .Select(x => x.StartDate).ToList();
                    categoryOptionDates = benefitCategories.Where(x => x.BenefitCategoryId == benefitCategoryId)
                                                           .SelectMany(x => x.BenefitCategoryOptions, (c, o) => o.EffectiveDate)
                                                           .ToList();
                }
                else
                {
                    categoryExtensionDates = benefitCategories.SelectMany(c => c.BenefitCategoryExtensions, (c, o) => o.EffectiveDate).ToList();
                    categoryDetailDates = benefitCategories.Select(x => x.StartDate).ToList();
                    categoryOptionDates = benefitCategories.SelectMany(x => x.BenefitCategoryOptions, (c, o) => o.EffectiveDate).ToList();

                }

                List<DateTime> effectiveDates = new List<DateTime>();

                effectiveDates.AddRange(categoryDetailDates);
                effectiveDates.AddRange(categoryOptionDates);
                effectiveDates.AddRange(categoryExtensionDates);

                return effectiveDates.Distinct().ToList();
            }
        }
        private async Task<GroupRiskPolicy> GetGroupRiskPolicyWithDetails(policy_Policy policy, bool isRetrieveBenefits = false, bool isRetrieveCategories = false)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _policyRepository.LoadAsync(policy, x => x.PolicyDetails);
                await _policyRepository.LoadAsync(policy, x => x.PolicyBinders);
                await _policyRepository.LoadAsync(policy, x => x.PolicyTreaties);
                await _policyRepository.LoadAsync(policy, x => x.ProductOption);

                var effectiveDate = GetPolicyDetailsEffectiveDates(policy).OrderByDescending(x => x).FirstOrDefault();
                return await GetGroupRiskPolicyWithDetails(policy, effectiveDate, isRetrieveBenefits, isRetrieveCategories);

            }
        }
        private async Task<GroupRiskPolicy> GetGroupRiskPolicyWithDetails(policy_Policy policy, DateTime effectiveDate, bool isRetrieveBenefits = false, bool isRetrieveCategories = false)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyDetail = policy.PolicyDetails.Where(x => x.EffectiveDate <= effectiveDate)
                                                       .OrderByDescending(x => x.EffectiveDate)
                                                       .First();
                policy.PolicyDetails.Clear();
                policy.PolicyDetails.Add(policyDetail);
                var groupRiskPolicy = GetGroupRiskPolicyModel(policy, effectiveDate);
                var policyEffectiveDates = GetPolicyDetailsEffectiveDates(policy);

                var policyOptions = await _policyOptionRepository.Where(p => p.PolicyId == policy.PolicyId && p.EffectiveDate <= effectiveDate)
                                                           .GroupBy(g => g.ProductOptionOptionItemValue.OptionItem.OptionTypeId)
                                                           .Select(gr => gr.Select(s => s)
                                                                            .OrderByDescending(o => o.EffectiveDate)
                                                                            .FirstOrDefault())
                                                           .ToListAsync();



                await _policyOptionRepository.LoadAsync(policyOptions, x => x.ProductOptionOptionItemValue);
                groupRiskPolicy.PolicyOptions = GetPolicyOptions(policyOptions);

                if (isRetrieveBenefits)
                {
                    var policyBenefitDetails = await _policyBenefitDetailRepository.Where(b => b.PolicyId == policy.PolicyId && b.StartDate <= effectiveDate)
                                                                                    .GroupBy(g => g.BenefitId)
                                                                                    .Select(gr => gr.Select(s => s)
                                                                                                      .OrderByDescending(o => o.StartDate)
                                                                                                      .FirstOrDefault())
                                                                                    .ToListAsync();
                    var policyBenefits = await GetGroupRiskPolicyBenefits(policyBenefitDetails, null, isRetrieveCategories);
                    groupRiskPolicy.GroupRiskPolicyBenefits = policyBenefits;


                }

                groupRiskPolicy.PolicyDetailsEffectiveDates = policyEffectiveDates;
                return groupRiskPolicy;
            }
        }
        private async Task<GroupRiskPolicy> GetGroupRiskPolicyWithDetails(int policyId, DateTime effectiveDate, bool isRetrieveBenefits = false, bool isRetrieveCategories = false)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = _policyRepository.Single(x => x.PolicyId == policyId, "Policy is not found");
                await _policyRepository.LoadAsync(policy, x => x.PolicyDetails);
                await _policyRepository.LoadAsync(policy, x => x.PolicyBinders);
                await _policyRepository.LoadAsync(policy, x => x.PolicyTreaties);
                await _policyRepository.LoadAsync(policy, x => x.ProductOption);
                await _policyTreatyRepository.LoadAsync(policy.PolicyTreaties, x => x.Treaty);

                return await GetGroupRiskPolicyWithDetails(policy, effectiveDate, isRetrieveBenefits, isRetrieveCategories);

            }
        }

        private List<PolicyOption> GetPolicyOptions(List<policy_PolicyOption> dbPolicyOptions)
        {
            var policyOptions = new List<PolicyOption>();
            foreach (var dbOption in dbPolicyOptions)
            {
                policyOptions.Add(new PolicyOption
                {
                    PolicyOptionId = dbOption.PolicyOptionId,
                    PolicyId = dbOption.PolicyId,
                    ProductOptionOptionItemValueId = dbOption.ProductOptionOptionItemValueId,
                    OverrideValue = dbOption.OverrideValue,
                    EffectiveDate = dbOption.EffectiveDate,
                    OptionItemField = dbOption.ProductOptionOptionItemValue.OptionItemField
                });
            }

            return policyOptions;

        }

        private GroupRiskPolicy GetGroupRiskPolicyModel(policy_Policy policy, DateTime? effectiveDate = null)
        {
            if (policy == null) return new GroupRiskPolicy();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                effectiveDate = effectiveDate ?? DateTimeHelper.SaNow;
                return new GroupRiskPolicy
                {
                    PolicyId = policy.PolicyId,
                    AnniversaryMonthTypeId = policy.PolicyDetails.FirstOrDefault()?.PolicyAnniversaryMonth ?? 0,
                    AdministratorId = policy.PolicyDetails.FirstOrDefault()?.PolicyAdministratorId ?? 0,
                    BillingFrequencyTypeId = (int)policy.PaymentFrequency,
                    BinderPartnerId = policy.PolicyBinders.FirstOrDefault()?.BinderId ?? 0,
                    BrokerageId = policy.BrokerageId,
                    ClientReference = policy.PolicyDetails.FirstOrDefault()?.PolicyName ?? string.Empty,
                    FundRolePlayerId = policy.PolicyDetails.FirstOrDefault()?.PolicyHolderId ?? null,
                    GroupRiskDealTypeId = 1,
                    LastRateUpdateDate = policy.PolicyDetails.FirstOrDefault()?.LastReviewDate,
                    NewEffectiveDate = policy.PolicyDetails.FirstOrDefault()?.EffectiveDate ?? default,
                    NextRateReviewDate = policy.PolicyDetails.FirstOrDefault()?.NextReviewDate,
                    PolicyNumber = policy.PolicyNumber,
                    ProductId = policy.ProductOption.ProductId,
                    ProductOptionId = policy.ProductOptionId,
                    ReinsuranceTreatyId =  policy.PolicyTreaties.Where(x => x.EffectiveDate <= effectiveDate?.Date)
                                                                     .OrderByDescending(o => o.EffectiveDate)
                                                                     .FirstOrDefault()?.TreatyId ?? 0,
                    RmaRelationshipManagerId = policy.PolicyDetails.FirstOrDefault()?.PolicyConsultantId ?? 0,
                    SchemeStatusId = (int)policy.PolicyStatus,
                    StartDate = policy.PolicyInceptionDate,
                    EndDate = policy.ExpiryDate
                };
            }
        }

        private async Task<GroupRiskPolicyBenefit> GetGroupRiskPolicyBenefitModelAsync(policy_PolicyBenefitDetail policyBenefit, product_Benefit benefit, List<DateTime> benefitDetailsDates)
        {
            var benefitOptions = new List<PolicyBenefitOption>();
            foreach (var benefitOption in policyBenefit.PolicyBenefitOptions)
            {
                benefitOptions.Add(new PolicyBenefitOption
                {
                    BenefitOptionId = benefitOption.BenefitOptionId,
                    BenefitOptionItemValueId = benefitOption.BenefitOptionItemValueId,
                    EffectiveDate = benefitOption.EffectiveDate,
                    OverrideValue = benefitOption.OverrideValue,
                    BenefitDetailId = benefitOption.BenefitDetailId,
                    OptionItemField = benefitOption.BenefitOptionItemValue.OptionItemField,
                    OptionItemCode = benefitOption.BenefitOptionItemValue.OptionItem.Code
                });
            }
            return new GroupRiskPolicyBenefit
            {
                StartDate = policyBenefit.StartDate,
                EndDate = policyBenefit.EndDate,
                NewEffectiveDate = policyBenefit.StartDate,
                BenefitId = policyBenefit.BenefitId,
                GlCode = string.Empty,
                PolicyId = policyBenefit.PolicyId,
                BenefitName = benefit.Name,
                BenefitCode = benefit.Code,
                BenefitGroup = benefit.BenefitGroup,
                BenefitDetailId = policyBenefit.BenefitDetailId,
                BenefitOptions = benefitOptions,
                BenefitDetailsEffectiveDates = benefitDetailsDates
            };
        }

        public async Task<PolicyOption> GetPolicyLevelOptionConfiguration(int policyId, OptionItemFieldEnum? optionItemField)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptionOptionItemValue = await _policyRepository.Where(x => x.PolicyId == policyId)
                                                                           .Join(_productProductOptionRepository,
                                                                                 pol => pol.ProductOptionId,
                                                                                 opt => opt.Id,
                                                                                 (pol, opt) => opt)
                                                                           .Join(_productOptionItemValueRepository,
                                                                                 opt => opt.Id,
                                                                                 val => val.ProductOptionId,
                                                                                 (opt, val) => val)
                                                                           .Where(x => x.OptionItemField == optionItemField)
                                                                           .FirstOrDefaultAsync();

                if (productOptionOptionItemValue == null)
                    return new PolicyOption();

                return new PolicyOption
                {
                    ProductOptionOptionItemValueId = productOptionOptionItemValue.ProductOptionOptionItemValueId,
                    OverrideValue = productOptionOptionItemValue.Value
                };

            }

        }

        public async Task<GroupRiskEmployerPremiumRateModel> GetGroupRiskEmployerPremiumRateModel(int employerRolePlayerId)
        {
            var groupRiskEmployerPremiumRateModel = new GroupRiskEmployerPremiumRateModel();
            groupRiskEmployerPremiumRateModel.EmployerRolePlayerId = employerRolePlayerId;
            var policyPremiumRateDetailModels = await GetEmployerPolicyPremiumRateDetail(employerRolePlayerId);
            if (policyPremiumRateDetailModels != null)
            {
                groupRiskEmployerPremiumRateModel.PolicyPremiumRateDetailModels.AddRange(policyPremiumRateDetailModels);
            }

            return groupRiskEmployerPremiumRateModel;
        }

        public async Task<List<PolicyBenefitCategory>> GetBenefitCategoriesForPremiumRatesBillingLevel(int policyId, int benefitId, DateTime effectiveDate)
        {
            var policyBenefitCategories = new List<PolicyBenefitCategory>();

            effectiveDate = DateTimeHelper.StartOfTheMonth(effectiveDate);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var benefitDetailIdList = await _policyBenefitDetailRepository.Where(x => x.PolicyId == policyId && x.BenefitId == benefitId).ToListAsync();

                var groupRiskPolicyBenefitCategories = await GetGroupRiskPolicyBenefitCategories(benefitDetailIdList, effectiveDate);

                foreach (var groupRiskPolicyBenefitCategory in groupRiskPolicyBenefitCategories)
                {
                    policyBenefitCategories.Add(new PolicyBenefitCategory
                    {
                        BenefitCategoryId = groupRiskPolicyBenefitCategory.BenefitCategoryId,
                        Description = groupRiskPolicyBenefitCategory.CategoryDescription,
                        Name = groupRiskPolicyBenefitCategory.Name,
                        BenefitDetailId = benefitDetailIdList.FirstOrDefault()?.BenefitDetailId ?? 0,

                    });
                }
            }

            return policyBenefitCategories;
        }

        public async Task GroupRiskBenefitPayrollUpsert(BenefitPayroll benefitPayroll)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string invoiceNumber;
                if ((benefitPayroll?.BenefitPayrollId ?? 0) > 0)
                    invoiceNumber = (await GetPayrollInvoiceDetails(new List<int> { benefitPayroll.BenefitPayrollId })).FirstOrDefault()?.InvoiceNumber ?? string.Empty;
                else
                 invoiceNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Invoice, "");

                await _policyRepository.ExecuteSqlCommandAsync(
                        DatabaseConstants.GroupRiskBenefitPayrollUpsert,
                        new SqlParameter("@BenefitDetailId", benefitPayroll?.BenefitDetailId),
                        new SqlParameter("@BenefitCategoryId", (object)benefitPayroll.BenefitCategoryId?? DBNull.Value),
                        new SqlParameter("@EffectiveDate", DateTimeHelper.StartOfTheMonth(benefitPayroll.EffectiveDate).ToString("yyyy-MM-dd")),
                        new SqlParameter("@Payroll_FixedAmt", benefitPayroll.FixedPremium),
                        new SqlParameter("@Payroll_NoOfMembers", benefitPayroll.NoOfMembers),
                        new SqlParameter("@Payroll_SumAssured", benefitPayroll.SumAssured),
                        new SqlParameter("@Payroll_TotalSalary", benefitPayroll.MonthlySalary),
                        new SqlParameter("@PayrollStatusId", (int)benefitPayroll.PayrollStatusType),
                        new SqlParameter("@UserID", RmaIdentity.Email),
                        new SqlParameter("@InvoiceNumber", invoiceNumber),
                        new SqlParameter("@TenantId", RmaIdentity.TenantId),
                        new SqlParameter { ParameterName = "@NewPayroll_ID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Output}
                        );
            }


        }

        public async Task<int> CreatePersonInsuredCategory(PersonInsuredCategory personInsuredCategory)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PersonInsuredCategory>(personInsuredCategory);
                _policyPersonInsuredCategoryRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PersonInsuredCategoryId;
            }
        }

        public async Task<int> EditPersonInsuredCategory(PersonInsuredCategory personInsuredCategory)
        {
            Contract.Requires(personInsuredCategory != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _policyPersonInsuredCategoryRepository.FirstOrDefaultAsync(a => a.PersonInsuredCategoryId == personInsuredCategory.PersonInsuredCategoryId);
                entity.PersonId = personInsuredCategory.PersonId;
                entity.PersonEmploymentId = personInsuredCategory.PersonEmploymentId;
                entity.BenefitCategoryId = personInsuredCategory.BenefitCategoryId;
                entity.EffectiveDate = personInsuredCategory.EffectiveDate;
                entity.DateJoinedPolicy = personInsuredCategory.DateJoinedPolicy;
                entity.PersonInsuredCategoryStatus = personInsuredCategory.PersonInsuredCategoryStatus;
                entity.IsDeleted = personInsuredCategory.IsDeleted;
                entity.CreatedBy = personInsuredCategory.CreatedBy;
                entity.CreatedDate = personInsuredCategory.CreatedDate;
                entity.ModifiedBy = personInsuredCategory.ModifiedBy;
                entity.ModifiedDate = personInsuredCategory.ModifiedDate;
                _policyPersonInsuredCategoryRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PersonInsuredCategoryId;
            }
        }

        public async Task<int> CreateInsuredSumAssured(InsuredSumAssured insuredSumAssured)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_InsuredSumAssured>(insuredSumAssured);
                _policyInsuredSumAssuredRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.InsuredSumAssuredId;
            }
        }

        public async Task<int> EditInsuredSumAssured(InsuredSumAssured insuredSumAssured)
        {
            Contract.Requires(insuredSumAssured != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _policyInsuredSumAssuredRepository.FirstOrDefaultAsync(a => a.InsuredSumAssuredId == insuredSumAssured.InsuredSumAssuredId);
                entity.PersonId = insuredSumAssured.PersonId;
                entity.BenefitDetailId = insuredSumAssured.BenefitDetailId;
                entity.EffectiveDate = insuredSumAssured.EffectiveDate;
                entity.AnnualSalary = insuredSumAssured.AnnualSalary;
                entity.Premium = insuredSumAssured.Premium;
                entity.ActualCoverAmount = insuredSumAssured.ActualCoverAmount;
                entity.PotentialCoverAmount = insuredSumAssured.PotentialCoverAmount;
                entity.ActualWaiverAmount = insuredSumAssured.ActualWaiverAmount;
                entity.PotentialWaiverAmount = insuredSumAssured.PotentialWaiverAmount;
                entity.MedicalPremWaiverAmount = insuredSumAssured.MedicalPremWaiverAmount;
                entity.ShareOfFund = insuredSumAssured.ShareOfFund;
                entity.IsDeleted = insuredSumAssured.IsDeleted;
                entity.ModifiedBy = insuredSumAssured.ModifiedBy;
                entity.ModifiedDate = insuredSumAssured.ModifiedDate;
                _policyInsuredSumAssuredRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.InsuredSumAssuredId;
            }
        }

        public async Task<bool> CreateEmployeeInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            if (employeeInsuredBenefit == null) return false;

            if (employeeInsuredBenefit.PersonEmploymentId < 0)
                employeeInsuredBenefit.PersonEmploymentId = null;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personInsuredCategory = new PersonInsuredCategory
                {
                    PersonId = employeeInsuredBenefit.PersonId,
                    BenefitDetailId = employeeInsuredBenefit.BenefitDetailId,
                    EffectiveDate = DateTimeHelper.StartOfTheMonth(employeeInsuredBenefit.EffectiveDate),
                    RolePlayerTypeId = employeeInsuredBenefit.RolePlayerTypeId,
                    BenefitCategoryId = employeeInsuredBenefit.BenefitCategoryId,
                    PersonEmploymentId = employeeInsuredBenefit.PersonEmploymentId,
                    PersonInsuredCategoryStatus = (PersonInsuredCategoryStatusEnum)employeeInsuredBenefit.PersonInsuredCategoryStatusId,
                    DateJoinedPolicy = employeeInsuredBenefit.DateJoinedPolicy
                };

                var personInsuredCategory_entity = Mapper.Map<policy_PersonInsuredCategory>(personInsuredCategory);
                _policyPersonInsuredCategoryRepository.Create(personInsuredCategory_entity);

                var insuredSumAssured = new InsuredSumAssured()
                {
                    PersonId = employeeInsuredBenefit.PersonId,
                    BenefitDetailId = employeeInsuredBenefit.BenefitDetailId,
                    EffectiveDate = DateTimeHelper.StartOfTheMonth(employeeInsuredBenefit.EffectiveDate),
                    AnnualSalary = employeeInsuredBenefit.AnnualSalary,
                    Premium = employeeInsuredBenefit.Premium,
                    ActualCoverAmount = employeeInsuredBenefit.ActualCoverAmount,
                    PotentialCoverAmount = employeeInsuredBenefit.PotentialCoverAmount,
                    ActualWaiverAmount = employeeInsuredBenefit.ActualWaiverAmount,
                    PotentialWaiverAmount = employeeInsuredBenefit.PotentialWaiverAmount,
                    MedicalPremWaiverAmount = employeeInsuredBenefit.MedicalPremWaiverAmount,
                    ShareOfFund = employeeInsuredBenefit.ShareOfFund
                };

                var insuredSumAssured_entity = Mapper.Map<policy_InsuredSumAssured>(insuredSumAssured);
                _policyInsuredSumAssuredRepository.Create(insuredSumAssured_entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<BenefitPayroll> GetBenefitPayrollById(int benefitPayrollId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefitPayroll = await _benefitPayrollRepository.Where(x => x.BenefitPayrollId == benefitPayrollId)
                                                                .Join(_policyRepository, b => b.PolicyBenefitDetail.PolicyId, y => y.PolicyId, (payroll, policy) => new
                                                                {
                                                                    payroll = payroll,
                                                                    policy.PolicyId,
                                                                    RolePlayerId = policy.PolicyOwnerId,
                                                                    BillingLevelOption = payroll.PolicyBenefitDetail.PolicyBenefitOptions.Where(x => x.BenefitOptionItemValue.OptionItem.OptionType.Code == "BillingLevel"
                                                                                                                                       && x.EffectiveDate <= payroll.EffectiveDate)
                                                                                                                    .OrderByDescending(o => o.EffectiveDate)
                                                                                                                    .FirstOrDefault()
                                                                })
                                                                .GroupJoin(_policyBenefitCategoryRepository, p => p.payroll.BenefitCategoryId, category => category.BenefitCategoryId,
                                                                (p, category) => new { p, category })
                                                                .SelectMany(x => x.category.DefaultIfEmpty(),
                                                                    (x, category) => new BenefitPayroll
                                                                    {
                                                                        BenefitPayrollId = x.p.payroll.BenefitPayrollId,
                                                                        BenefitDetailId = x.p.payroll.BenefitDetailId,
                                                                        BenefitCategoryId = x.p.payroll.BenefitCategoryId,
                                                                        PolicyId = x.p.PolicyId,
                                                                        RolePlayerId = x.p.RolePlayerId,
                                                                        EffectiveDate = x.p.payroll.EffectiveDate,
                                                                        LinkedBenefitPayrollId = x.p.payroll.LinkedBenefitPayrollId,
                                                                        MonthlySalary = x.p.payroll.MonthlySalary,
                                                                        SumAssured = x.p.payroll.SumAssured,
                                                                        NoOfMembers = x.p.payroll.NoOfMembers,
                                                                        FixedPremium = x.p.payroll.FixedSum,
                                                                        BenefitCategory = category.Name ?? string.Empty,
                                                                        PayrollStatusType = (BenefitPayrollStatusTypeEnum)x.p.payroll.PayrollStatusId,
                                                                        BillingLevel = x.p.BillingLevelOption.BenefitOptionItemValue.OptionItem.Name,
                                                                        LastUpdatedDate = x.p.payroll.ModifiedDate
                                                                    })
                                                                .FirstOrDefaultAsync();

                if (benefitPayroll == null)
                    throw new BusinessException("Payroll not found");
                var invoiceDetails = (await GetPayrollInvoiceDetails(new List<int> { benefitPayroll.BenefitPayrollId })) ?? new List<BenefitPayrollInvoice>();

                var benefitRate = await _policyBenefitRateRepository.Where(x => x.BenefitDetailId == benefitPayroll.BenefitDetailId && x.IsActive
                                                                            && x.BenefitCategoryId == benefitPayroll.BenefitCategoryId
                                                                            && x.EffectiveDate <= benefitPayroll.EffectiveDate)
                                                                .OrderByDescending(x => x.EffectiveDate)
                                                                .FirstOrDefaultAsync();
                await _policyBenefitRateRepository.LoadAsync(benefitRate, r => r.PolicyBenefitDetail);

                var invoice = invoiceDetails.Where(x => x.BenefitPayrollId == benefitPayroll.BenefitPayrollId && x.BenefitRateId == benefitRate.BenefitRateId
                                                        && x.InvoiceDate <= benefitPayroll.EffectiveDate)
                                            .OrderByDescending(x => x.InvoiceDate)
                                            .FirstOrDefault();
                var billingBasisOption = await _optionItemRepository.Where(x => x.OptionType.Code == "BillingBasis" && x.Code == benefitRate.BillingBasis)
                                                                    .FirstOrDefaultAsync();


                benefitPayroll.PremiumDue = invoice?.TotalInvoiceAmount ?? 0;
                benefitPayroll.BillingRate = benefitRate.RateValue;
                benefitPayroll.BillingMethodCode = benefitRate.BillingBasis;
                benefitPayroll.BillingMethod = billingBasisOption.Name;
                benefitPayroll.BenefitId = benefitRate.PolicyBenefitDetail.BenefitId;


                return benefitPayroll;
            }
        }
        public async Task<List<BenefitPayroll>> GetBenefitPayrollDetails(int benefitDetailId, int categoryId, DateTime? dateFrom, DateTime? dateTo)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var benefitPayrolls = await _benefitPayrollRepository.Where(x => x.BenefitDetailId == benefitDetailId &&
                                                                            x.IsActive &&
                                                                            (x.BenefitCategoryId == categoryId || categoryId == -1) && (dateFrom.HasValue && x.EffectiveDate >= dateFrom) &&
                                                                           (dateTo.HasValue && x.EffectiveDate <= dateTo))
                                                                .Join(_policyRepository, b => b.PolicyBenefitDetail.PolicyId, y => y.PolicyId, (payroll, policy) => new
                                                                {
                                                                    payroll = payroll,
                                                                    policy.PolicyId,
                                                                    RolePlayerId = policy.PolicyOwnerId,
                                                                    BillingLevelOption = payroll.PolicyBenefitDetail.PolicyBenefitOptions.Where(x => x.BenefitOptionItemValue.OptionItem.OptionType.Code == "BillingLevel"
                                                                                                                                       && x.EffectiveDate <= payroll.EffectiveDate)
                                                                                                                    .OrderByDescending(o => o.EffectiveDate)
                                                                                                                    .FirstOrDefault()
                                                                })
                                                                .GroupJoin(_policyBenefitCategoryRepository, p => p.payroll.BenefitCategoryId, category => category.BenefitCategoryId,
                                                                (p, category) => new { p, category })
                                                                .SelectMany(x => x.category.DefaultIfEmpty(),
                                                                    (x, category) => new BenefitPayroll
                                                                    {
                                                                        BenefitPayrollId = x.p.payroll.BenefitPayrollId,
                                                                        BenefitDetailId = x.p.payroll.BenefitDetailId,
                                                                        BenefitCategoryId = x.p.payroll.BenefitCategoryId,
                                                                        PolicyId = x.p.PolicyId,
                                                                        RolePlayerId = x.p.RolePlayerId,
                                                                        EffectiveDate = x.p.payroll.EffectiveDate,
                                                                        LinkedBenefitPayrollId = x.p.payroll.LinkedBenefitPayrollId,
                                                                        MonthlySalary = x.p.payroll.MonthlySalary,
                                                                        SumAssured = x.p.payroll.SumAssured,
                                                                        NoOfMembers = x.p.payroll.NoOfMembers,
                                                                        FixedPremium = x.p.payroll.FixedSum,
                                                                        BenefitCategory = category.Name ?? string.Empty,
                                                                        PayrollStatusType = (BenefitPayrollStatusTypeEnum)x.p.payroll.PayrollStatusId,
                                                                        BillingLevel = x.p.BillingLevelOption.BenefitOptionItemValue.OptionItem.Name,
                                                                        LastUpdatedDate = x.p.payroll.ModifiedDate
                                                                    })
                                                                .ToListAsync();

                var invoiceDetails = (await GetPayrollInvoiceDetails(benefitPayrolls.Select(x => x.BenefitPayrollId).ToList())) ?? new List<BenefitPayrollInvoice>();

                foreach (var payroll in benefitPayrolls)
                {
                    var benefitRate = await _policyBenefitRateRepository.Where(x => x.BenefitDetailId == payroll.BenefitDetailId && x.IsActive
                                                                         && x.BenefitCategoryId == payroll.BenefitCategoryId
                                                                         && x.EffectiveDate <= payroll.EffectiveDate)
                                                             .OrderByDescending(x => x.EffectiveDate)
                                                             .FirstOrDefaultAsync();
                    await _policyBenefitRateRepository.LoadAsync(benefitRate, r => r.PolicyBenefitDetail);

                    var invoice = invoiceDetails.Where(x => x.BenefitPayrollId == payroll.BenefitPayrollId && x.BenefitRateId == benefitRate.BenefitRateId
                                                           && x.InvoiceDate <= payroll.EffectiveDate)
                                                .OrderByDescending(x => x.InvoiceDate)
                                                .FirstOrDefault();
                    var billingBasisOption = await _optionItemRepository.Where(x => x.OptionType.Code == "BillingBasis" && x.Code == benefitRate.BillingBasis)
                                                                      .FirstOrDefaultAsync();


                    payroll.PremiumDue = invoice?.TotalInvoiceAmount ?? 0;
                    payroll.BillingRate = benefitRate.RateValue;
                    payroll.BillingMethodCode = benefitRate.BillingBasis;
                    payroll.BillingMethod = billingBasisOption.Name;
                    payroll.BenefitId = benefitRate.PolicyBenefitDetail.BenefitId;
                }

                return benefitPayrolls;
            }
        }

        private async Task<List<BenefitPayrollInvoice>> GetPayrollInvoiceDetails(List<int> parolls)
        {
            return await _invoiceService.GetInvoicesForBenefitPayrolls(parolls);
        }

        public async Task<List<EmployeeInsuredCategoryModel>> GetEmployeeInsuredCategories(int employeeRolePlayerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personInsuredCategories = await _policyPersonInsuredCategoryRepository.Where(p => p.PersonId == employeeRolePlayerId).ToListAsync();
                //await _policyPersonInsuredCategoryRepository.LoadAsync(personInsuredCategories, a => a.InsuredSumAssureds);

                var employeeInsuredBenefitModel = new List<EmployeeInsuredCategoryModel>();
                foreach (var personInsuredCategory in personInsuredCategories)
                {
                    var policyBenefitCategory = await _policyBenefitCategoryRepository.FirstOrDefaultAsync(p => p.BenefitCategoryId == personInsuredCategory.BenefitCategoryId);
                    var policyBenefitDetail = await _policyBenefitDetailRepository.FirstOrDefaultAsync(p => p.BenefitDetailId == policyBenefitCategory.BenefitDetailId);
                    var policy = await _policyDetailRepository.FirstOrDefaultAsync(p => p.PolicyId == policyBenefitDetail.PolicyId);
                    var benefit = await _benefitRepository.FirstOrDefaultAsync(p => p.Id == policyBenefitDetail.BenefitId);
                    var InsuredSumAssured = await _policyInsuredSumAssuredRepository.Where(p => p.PersonId == employeeRolePlayerId).FirstOrDefaultAsync();

                    var modeldata = new EmployeeInsuredCategoryModel()
                    {
                        PolicyId = policy.PolicyId,
                        PolicyName = policy.PolicyName,

                        BenefitId = benefit.Id,
                        BenefitName = benefit.Name,

                        BenefitCategoryId = personInsuredCategory.BenefitCategoryId,
                        BenefitCategoryName = policyBenefitCategory.Name,

                        PersonInsuredCategoryId = personInsuredCategory.PersonInsuredCategoryId,
                        PersonId = personInsuredCategory.PersonId,
                        PersonEmploymentId = personInsuredCategory.PersonEmploymentId,
                        PersonInsuredCategoryEffectiveDate = personInsuredCategory.EffectiveDate,
                        DateJoinedPolicy = personInsuredCategory.DateJoinedPolicy,
                        PersonInsuredCategoryStatusId = personInsuredCategory.PersonInsuredCategoryStatus,

                        InsuredSumAssuredId = InsuredSumAssured.InsuredSumAssuredId,
                        InsuredSumAssuredEffectiveDate = InsuredSumAssured.EffectiveDate,
                        AnnualSalary = InsuredSumAssured.AnnualSalary,
                        Premium = InsuredSumAssured.Premium,
                        ActualCoverAmount = InsuredSumAssured.ActualCoverAmount,
                        PotentialCoverAmount = InsuredSumAssured.PotentialCoverAmount,
                        ActualWaiverAmount = InsuredSumAssured.ActualWaiverAmount,
                        PotentialWaiverAmount = InsuredSumAssured.PotentialWaiverAmount,
                        MedicalPremWaiverAmount = InsuredSumAssured.MedicalPremWaiverAmount,
                        ShareOfFund = InsuredSumAssured.ShareOfFund
                    };

                    employeeInsuredBenefitModel.Add(modeldata);
                }

                return employeeInsuredBenefitModel;
            }
        }

        public async Task<List<EmployeeInsuredCategoryModel>> GetEmployeeInsuredCategoriesByEmployer(int employeeRolePlayerId, int employerRolePlayerId)
        {
            List<EmployeeInsuredCategoryModel> allBenefits = new List<EmployeeInsuredCategoryModel>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var employeeInsuredBenefitModel = new List<EmployeeInsuredCategoryModel>();
                var employment = await _rolePlayerService.GetPersonEmployment(employeeRolePlayerId, employerRolePlayerId);
                if (employment != null)
                {
                    var mainMemberBenefits = await GetBenefits(employeeRolePlayerId, employment.PersonEmpoymentId, RolePlayerTypeEnum.MainMemberSelf);
                    if (mainMemberBenefits.Count > 0)
                    {
                        allBenefits.AddRange(mainMemberBenefits);
                        var OtherInsuredlife = await GetEmployeeOtherInsuredLives(employeeRolePlayerId, employerRolePlayerId);
                        foreach (var insuredLife in OtherInsuredlife)
                        {
                            var insuredLifeBenefits = await GetBenefits(insuredLife.OtherInsureLifeRolePlayerId, null, insuredLife.Relationship);
                            allBenefits.AddRange(insuredLifeBenefits);
                        }
                    }
                }
            }

            return allBenefits;
        }

        public async Task<List<EmployeeInsuredCategoryModel>> GetBenefits(int employeeRolePlayerId, int? personEmpoymentId, RolePlayerTypeEnum rolePlayerType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var employeeInsuredBenefitModel = new List<EmployeeInsuredCategoryModel>();

                var personInsuredCategories = _policyPersonInsuredCategoryRepository.Where(p => p.PersonId == employeeRolePlayerId && p.PersonEmploymentId == personEmpoymentId && p.RolePlayerTypeId == (int)rolePlayerType)
                                                                                        .GroupBy(g => g.BenefitDetailId)
                                                                                        .Select(group => new { benefitDetailId = group.Key, benefit = group.Where(row => row.EffectiveDate == group.Max(r => r.EffectiveDate)).Select(s => s.PersonInsuredCategoryId) }).ToList();

                var insuredSumAssured = _policyInsuredSumAssuredRepository.Where(p => p.PersonId == employeeRolePlayerId)
                                                                .GroupBy(g => g.BenefitDetailId)
                                                                .Select(group => new { benefitDetailId = group.Key, sumAssuredId = group.Where(row => row.EffectiveDate == group.Max(r => r.EffectiveDate)).Select(s => s.InsuredSumAssuredId) }).ToList();

                var benefitAndSumAssuredIds = new List<BenefitCategoryInsured>();
                foreach (var category in personInsuredCategories)
                {
                    var benefitId = category.benefitDetailId;
                    var personInsuredCategoryId = category.benefit.OrderByDescending(x => x).First();
                    var insuredSums = insuredSumAssured.Where(sum => sum.benefitDetailId == benefitId).Select(s => s.sumAssuredId).First();
                    var insuredSumAssuredId = insuredSums.OrderByDescending(o => o).First();
                    BenefitCategoryInsured BenefitAndSumAssuredId = new BenefitCategoryInsured { PersonInsuredCategoryId = personInsuredCategoryId, InsuredSumAssuredId = insuredSumAssuredId };
                    benefitAndSumAssuredIds.Add(BenefitAndSumAssuredId);
                }

                return await GetBenefitAndSumAssured(benefitAndSumAssuredIds);
            }
        }        

        private async Task<List<EmployeeInsuredCategoryModel>> GetBenefitAndSumAssured(List<BenefitCategoryInsured> benefitAndSumAssuredIds)
        {
            var employeeInsuredBenefitModel = new List<EmployeeInsuredCategoryModel>();
            foreach (var benefitAndSumAssuredIds_row in benefitAndSumAssuredIds)
            {
                var personInsuredCategory = await _policyPersonInsuredCategoryRepository.Where(ben => ben.PersonInsuredCategoryId == benefitAndSumAssuredIds_row.PersonInsuredCategoryId).FirstAsync();
                var policyBenefitCategory = await _policyBenefitCategoryRepository.FirstOrDefaultAsync(p => p.BenefitCategoryId == personInsuredCategory.BenefitCategoryId);
                var policyBenefitDetail = await _policyBenefitDetailRepository.FirstOrDefaultAsync(p => p.BenefitDetailId == policyBenefitCategory.BenefitDetailId);
                var policy = await _policyDetailRepository.FirstAsync(p => p.PolicyId == policyBenefitDetail.PolicyId);
                var benefit = await _benefitRepository.FirstAsync(p => p.Id == policyBenefitDetail.BenefitId);
                var insuredSumAssured = await _policyInsuredSumAssuredRepository.Where(sum => sum.InsuredSumAssuredId == benefitAndSumAssuredIds_row.InsuredSumAssuredId).FirstAsync();
                var person = await _rolePlayerService.GetPerson((int)personInsuredCategory.PersonId);

                var modeldata = new EmployeeInsuredCategoryModel()
                {
                    PolicyId = policy.PolicyId,
                    PolicyName = policy.PolicyName,

                    BenefitId = benefit.Id,
                    BenefitName = benefit.Name,

                    BenefitCategoryId = personInsuredCategory.BenefitCategoryId,
                    BenefitCategoryName = policyBenefitCategory.Name,

                    PersonInsuredCategoryId = personInsuredCategory.PersonInsuredCategoryId,
                    PersonId = personInsuredCategory.PersonId,
                    PersonName = person.Person.FirstName + ' ' + person.Person.Surname,
                    BenefitDetailId = personInsuredCategory.BenefitDetailId,
                    RolePlayerTypeId = personInsuredCategory.RolePlayerTypeId,
                    PersonEmploymentId = personInsuredCategory.PersonEmploymentId,
                    PersonInsuredCategoryEffectiveDate = personInsuredCategory.EffectiveDate,
                    DateJoinedPolicy = personInsuredCategory.DateJoinedPolicy,
                    PersonInsuredCategoryStatusId = personInsuredCategory.PersonInsuredCategoryStatus,

                    InsuredSumAssuredId = insuredSumAssured.InsuredSumAssuredId,
                    InsuredSumAssuredEffectiveDate = insuredSumAssured.EffectiveDate,
                    AnnualSalary = insuredSumAssured.AnnualSalary,
                    Premium = insuredSumAssured.Premium,
                    ActualCoverAmount = insuredSumAssured.ActualCoverAmount,
                    PotentialCoverAmount = insuredSumAssured.PotentialCoverAmount,
                    ActualWaiverAmount = insuredSumAssured.ActualWaiverAmount,
                    PotentialWaiverAmount = insuredSumAssured.PotentialWaiverAmount,
                    MedicalPremWaiverAmount = insuredSumAssured.MedicalPremWaiverAmount,
                    ShareOfFund = insuredSumAssured.ShareOfFund
                }; 

                employeeInsuredBenefitModel.Add(modeldata);
            }
            return employeeInsuredBenefitModel;
        }

        public async Task<bool> CreateEmployeeOtherInsuredLife(EmployeeOtherInsuredlifeModel employeeOtherInsuredlife)
        {
            if (employeeOtherInsuredlife == null) return false;

            var OtherInsuredlife = new RolePlayerModel
            {
                RolePlayerId = 0,
                DisplayName = employeeOtherInsuredlife.Name + " " + employeeOtherInsuredlife.Surname,
                RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                ClientType = ClientTypeEnum.Individual,
                MemberStatus = MemberStatusEnum.Active,
                Person = new Person {
                    RolePlayerId = 0,
                    FirstName = employeeOtherInsuredlife.Name,
                    Surname = employeeOtherInsuredlife.Surname,
                    IdType = employeeOtherInsuredlife.IdType,
                    Nationality = employeeOtherInsuredlife.Nationality,
                    IdNumber = employeeOtherInsuredlife.IdNumber,
                    DateOfBirth = employeeOtherInsuredlife.DateOfBirth,
                    Title = employeeOtherInsuredlife.Title,
                    Gender = employeeOtherInsuredlife.Gender,
                    MaritalStatus = employeeOtherInsuredlife.MaritalStatus,
                    Initials = employeeOtherInsuredlife.Initials,
                    TaxNumber = employeeOtherInsuredlife.TaxNumber,
                    IsAlive = true
                },

                FromRolePlayers = new List<RolePlayerRelation> { new RolePlayerRelation {
                        FromRolePlayerId = 0,
                        ToRolePlayerId = employeeOtherInsuredlife.EmployeeRolePlayerId,
                        RolePlayerTypeId = (int)employeeOtherInsuredlife.Relationship
                    }
                    }
            };

                var OtherInsuredlife_RolePlayerId = await _rolePlayerService.CreateRolePlayer(OtherInsuredlife);

                if (OtherInsuredlife_RolePlayerId > 0)
                    return true;
                else
                    return false;
            
        }

        public async Task UpdateEmployeeOtherInsuredLife(EmployeeOtherInsuredlifeModel employeeOtherInsuredlife)
        {
            Contract.Requires(employeeOtherInsuredlife != null);

            var otherInsureRolePlayer = await _rolePlayerService.GetRolePlayer(employeeOtherInsuredlife.OtherInsureLifeRolePlayerId);
            if(otherInsureRolePlayer != null)
            {
                otherInsureRolePlayer.DisplayName = employeeOtherInsuredlife.Name + " " + employeeOtherInsuredlife.Surname;
                if(otherInsureRolePlayer.Person != null)
                {
                    otherInsureRolePlayer.Person.FirstName = employeeOtherInsuredlife.Name;
                    otherInsureRolePlayer.Person.Surname = employeeOtherInsuredlife.Surname;
                    otherInsureRolePlayer.Person.IdType = employeeOtherInsuredlife.IdType;
                    otherInsureRolePlayer.Person.Nationality = employeeOtherInsuredlife.Nationality;
                    otherInsureRolePlayer.Person.IdNumber = employeeOtherInsuredlife.IdNumber;
                    otherInsureRolePlayer.Person.DateOfBirth = employeeOtherInsuredlife.DateOfBirth;
                    otherInsureRolePlayer.Person.Title = employeeOtherInsuredlife.Title;
                    otherInsureRolePlayer.Person.Gender = employeeOtherInsuredlife.Gender;
                    otherInsureRolePlayer.Person.MaritalStatus = employeeOtherInsuredlife.MaritalStatus;
                    otherInsureRolePlayer.Person.Initials = employeeOtherInsuredlife.Initials;
                    otherInsureRolePlayer.Person.TaxNumber = employeeOtherInsuredlife.TaxNumber;
                }

                var rolePlayerRelation = otherInsureRolePlayer.FromRolePlayers.Where(x => x.FromRolePlayerId == employeeOtherInsuredlife.OtherInsureLifeRolePlayerId
                        && x.ToRolePlayerId == employeeOtherInsuredlife.EmployeeRolePlayerId).FirstOrDefault();

                rolePlayerRelation.RolePlayerTypeId = (int)employeeOtherInsuredlife.Relationship;

                await _rolePlayerService.UpdateRolePlayer(otherInsureRolePlayer);
            }          
        }

        public async Task<List<EmployeeOtherInsuredlifeModel>> GetEmployeeOtherInsuredLives(int employeeRolePlayerId, int employerRolePlayerId)
        {
            var otherInsuredLives = new List<EmployeeOtherInsuredlifeModel>();
            List<RolePlayerTypeEnum> RolePlayerTypeFilters = new List<RolePlayerTypeEnum> { RolePlayerTypeEnum.Spouse,RolePlayerTypeEnum.Child,
            RolePlayerTypeEnum.Other, RolePlayerTypeEnum.Niece, RolePlayerTypeEnum.Nephew, RolePlayerTypeEnum.Mother, RolePlayerTypeEnum.Father};

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var employment = await _rolePlayerService.GetPersonEmployment(employeeRolePlayerId, employerRolePlayerId);
                if (employment != null)
                {
                    var rolePlayerRelations = new List<client_RolePlayerRelation>();

                    rolePlayerRelations = await (from relation in _rolePlayerRelationRepository
                                                    where relation.ToRolePlayerId == employeeRolePlayerId
                                                        && RolePlayerTypeFilters.Contains((RolePlayerTypeEnum)relation.RolePlayerType.RolePlayerTypeId)
                                                    select relation).ToListAsync();

                    await _rolePlayerRelationRepository.LoadAsync(rolePlayerRelations, t => t.FromRolePlayer);

                    foreach (var rolePlayerRelation in rolePlayerRelations)
                    {
                        var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(r => r.RolePlayerId == rolePlayerRelation.FromRolePlayer.RolePlayerId);
                        var person = await _personRepository.FirstOrDefaultAsync(p => p.RolePlayerId == rolePlayerRelation.FromRolePlayer.RolePlayerId);
                        rolePlayer.Person = person;
                        
                        var modeldata = new EmployeeOtherInsuredlifeModel()
                        {
                                EmployeeRolePlayerId = employeeRolePlayerId,
                                OtherInsureLifeRolePlayerId = rolePlayerRelation.FromRolePlayer.RolePlayerId,
                                Relationship = (RolePlayerTypeEnum)rolePlayerRelation.RolePlayerTypeId,
                                EffectiveDate = DateTime.Now,
                                Initials = rolePlayer.Person.Initials,
                                Name = rolePlayer.Person.FirstName,
                                Surname = rolePlayer.Person.Surname,
                                IdNumber = rolePlayer.Person.IdNumber,
                                DateOfBirth = rolePlayer.Person.DateOfBirth,
                                TaxNumber = rolePlayer.Person.TaxNumber,
                                Gender = rolePlayer.Person.Gender,
                                MaritalStatus = (MaritalStatusEnum)rolePlayer.Person.MaritalStatus,
                                IdType = (IdTypeEnum)rolePlayer.Person.IdType,
                                Nationality = (NationalityEnum)rolePlayer.Person.Nationality,
                                Title = (TitleEnum)rolePlayer.Person.Title
                        };
                            
                        otherInsuredLives.Add(modeldata);
                    }
                }
            }

            return otherInsuredLives;
        }

        public async Task<List<Person>> GetEmployeesByEmployerId(int employerRolePlayerId)
        {
            var employees = new List<Person>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEmployments = _personEmploymentRepository.AsQueryable();
                personEmployments = personEmployments.Where(r => r.EmployerRolePlayerId == employerRolePlayerId);
                await _personEmploymentRepository.LoadAsync(personEmployments, e => e.Person);

                var data = await personEmployments.Where(r => r.EmployerRolePlayerId == employerRolePlayerId).Select(e => e.Person).ToListAsync();
                employees = Mapper.Map<List<Person>>(data);

                return employees;
            }
        }

        public async Task<PagedRequestResult<Person>> GetPagedEmployeesByEmployerId(EmployeeSearchRequest employeeSearchRequest)
        {
            Contract.Requires(employeeSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _personEmploymentRepository.AsQueryable();

                if (employeeSearchRequest.EmployerRolePlayerId.HasValue)
                {
                    var employerRolePlayerId = employeeSearchRequest.EmployerRolePlayerId.Value;
                    query = query.Where(r => r.EmployerRolePlayerId == employerRolePlayerId);
                }

                if (!string.IsNullOrEmpty(employeeSearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = employeeSearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.EmployeeNumber.Contains(filter) || r.Person.FirstName.Contains(filter) || r.Person.Surname.Contains(filter) || r.Person.IdNumber.Contains(filter));
                }

                await _personEmploymentRepository.LoadAsync(query, e => e.Person);
                var employeesQuery = query.Select(e => e.Person);
                var pagedEmployees = await employeesQuery.ToPagedResult(employeeSearchRequest.PagedRequest);
                var data = Mapper.Map<List<Person>>(pagedEmployees.Data);

                return new PagedRequestResult<Person>
                {
                    Page = employeeSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(pagedEmployees.RowCount / (double)employeeSearchRequest.PagedRequest.PageSize),
                    RowCount = pagedEmployees.RowCount,
                    PageSize = employeeSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task<EmployeeInsuredCategoryModel> GetInsuredCategoryByEffectiveDate(int employeeRolePlayerId, int personEmploymentId, int rolePlayerType, int benefitDetailId, DateTime effectiveDate)
        {
            var employeeInsuredBenefitModel = new EmployeeInsuredCategoryModel();

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                int? _personEmploymentId = null;
                if (personEmploymentId > 0)
                {
                    _personEmploymentId = personEmploymentId;
                }

                var personInsuredCategory = _policyPersonInsuredCategoryRepository.Where(p => p.PersonId == employeeRolePlayerId
                                                                                        && p.PersonEmploymentId == _personEmploymentId
                                                                                        && p.RolePlayerTypeId == (int)rolePlayerType
                                                                                        && p.BenefitDetailId == benefitDetailId
                                                                                        && p.EffectiveDate <= effectiveDate)
                                                                                    .OrderByDescending(o => o.EffectiveDate).FirstOrDefault();

                var insuredSumAssured = _policyInsuredSumAssuredRepository.Where(s => s.PersonId == employeeRolePlayerId
                                                                                && s.BenefitDetailId == benefitDetailId
                                                                                && s.EffectiveDate <= effectiveDate)
                                                                            .OrderByDescending(o => o.EffectiveDate).FirstOrDefault();

                if (personInsuredCategory != null && insuredSumAssured != null)
                {
                    var policyBenefitCategory = await _policyBenefitCategoryRepository.FirstOrDefaultAsync(p => p.BenefitCategoryId == personInsuredCategory.BenefitCategoryId);
                    var policyBenefitDetail = await _policyBenefitDetailRepository.FirstOrDefaultAsync(p => p.BenefitDetailId == benefitDetailId);
                    var policy = await _policyDetailRepository.FirstAsync(p => p.PolicyId == policyBenefitDetail.PolicyId);
                    var benefit = await _benefitRepository.FirstAsync(p => p.Id == policyBenefitDetail.BenefitId);
                    var person = await _rolePlayerService.GetPerson((int)personInsuredCategory.PersonId);

                    var modeldata = new EmployeeInsuredCategoryModel()
                    {
                        PolicyId = policy.PolicyId,
                        PolicyName = policy.PolicyName,

                        BenefitId = benefit.Id,
                        BenefitName = benefit.Name,

                        BenefitCategoryId = personInsuredCategory.BenefitCategoryId,
                        BenefitCategoryName = policyBenefitCategory.Name,

                        PersonInsuredCategoryId = personInsuredCategory.PersonInsuredCategoryId,
                        PersonId = personInsuredCategory.PersonId,
                        PersonName = person.Person.FirstName + ' ' + person.Person.Surname,
                        BenefitDetailId = personInsuredCategory.BenefitDetailId,
                        RolePlayerTypeId = personInsuredCategory.RolePlayerTypeId,
                        PersonEmploymentId = personInsuredCategory.PersonEmploymentId,
                        PersonInsuredCategoryEffectiveDate = personInsuredCategory.EffectiveDate,
                        DateJoinedPolicy = personInsuredCategory.DateJoinedPolicy,
                        PersonInsuredCategoryStatusId = personInsuredCategory.PersonInsuredCategoryStatus,

                        InsuredSumAssuredId = insuredSumAssured.InsuredSumAssuredId,
                        InsuredSumAssuredEffectiveDate = insuredSumAssured.EffectiveDate,
                        AnnualSalary = insuredSumAssured.AnnualSalary,
                        Premium = insuredSumAssured.Premium,
                        ActualCoverAmount = insuredSumAssured.ActualCoverAmount,
                        PotentialCoverAmount = insuredSumAssured.PotentialCoverAmount,
                        ActualWaiverAmount = insuredSumAssured.ActualWaiverAmount,
                        PotentialWaiverAmount = insuredSumAssured.PotentialWaiverAmount,
                        MedicalPremWaiverAmount = insuredSumAssured.MedicalPremWaiverAmount,
                        ShareOfFund = insuredSumAssured.ShareOfFund
                    };

                    employeeInsuredBenefitModel = modeldata;
                }
            }
            return employeeInsuredBenefitModel;
        }

        
        public async Task<bool> UpdateEmployeeInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefitModel)
        {
            if (employeeInsuredBenefitModel == null) return false;

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var changesOnBenefitCategory = await GetChangesOnBenefitCategory(employeeInsuredBenefitModel);
                if (changesOnBenefitCategory == ChangesOnBenefitCategory.None)
                {
                    /// check if the effective date changed: send back record(id) v.s. database record
                    if (IsBenefitCategoryEffectiveDateChanged(employeeInsuredBenefitModel))
                    {
                        var effectiveDates = await GetInsuredCategoryEffectiveDates(employeeInsuredBenefitModel.PersonId, (int)employeeInsuredBenefitModel.PersonEmploymentId, employeeInsuredBenefitModel.RolePlayerTypeId, employeeInsuredBenefitModel.BenefitDetailId);
                        /// check if is a NEW effective date
                        if (!effectiveDates.Contains(employeeInsuredBenefitModel.EffectiveDate.Date))
                        {
                            /// insert new record
                            return await CreateEmployeeInsuredCategory(employeeInsuredBenefitModel);
                        }
                        else
                        {
                            /// update exesting record
                            return await UpdateBenefitCategory(employeeInsuredBenefitModel);
                        }
                    }
                    else
                    {
                        return false;
                    }
                }

                if (changesOnBenefitCategory == ChangesOnBenefitCategory.Both)
                {
                    /// check if the effective date changed: send back record(id) v.s. database record                   
                    var effectiveDates = await GetInsuredCategoryEffectiveDates(employeeInsuredBenefitModel.PersonId, (int)employeeInsuredBenefitModel.PersonEmploymentId, employeeInsuredBenefitModel.RolePlayerTypeId, employeeInsuredBenefitModel.BenefitDetailId); 
                    /// check if is a NEW effective date
                    if (!effectiveDates.Contains(employeeInsuredBenefitModel.EffectiveDate.Date))
                    {
                        /// insert new record
                        return await CreateEmployeeInsuredCategory(employeeInsuredBenefitModel);
                    }
                    else
                    {
                        /// update exesting record
                        return await UpdateBenefitCategory(employeeInsuredBenefitModel);
                    }           
                }

                if (changesOnBenefitCategory == ChangesOnBenefitCategory.InsuredSumAssured)
                {
                    /// check if the effective date changed: send back record(id) v.s. database record
                    if (employeeInsuredBenefitModel.EffectiveDate != employeeInsuredBenefitModel.InsuredSumAssuredEffectiveDate)
                    {
                        var effectiveDates = await GetInsuredSumAssuredEffectiveDates(employeeInsuredBenefitModel.PersonId, employeeInsuredBenefitModel.BenefitDetailId);
                        /// check if is a NEW effective date
                        if (!effectiveDates.Contains(employeeInsuredBenefitModel.EffectiveDate.Date))
                        {
                            /// insert new record
                            return await CreateInsuredSumAssured(employeeInsuredBenefitModel);
                        }
                        else
                        {
                            /// update exesting record
                            return await UpdateInsuredSumAssured(employeeInsuredBenefitModel);
                        }
                    }
                    else
                    {
                        return await UpdateInsuredSumAssured(employeeInsuredBenefitModel);
                    }
                }

                if (changesOnBenefitCategory == ChangesOnBenefitCategory.PersonInsuredCategory)
                {
                    /// check if the effective date changed: send back record(id) v.s. database record
                    if (employeeInsuredBenefitModel.EffectiveDate != employeeInsuredBenefitModel.PersonInsuredCategoryEffectiveDate)
                    {
                        var effectiveDates = await GetPersonInsuredCategoryEffectiveDates(employeeInsuredBenefitModel.PersonId, (int)employeeInsuredBenefitModel.PersonEmploymentId, employeeInsuredBenefitModel.RolePlayerTypeId, employeeInsuredBenefitModel.BenefitDetailId);
                        /// check if is a NEW effective date
                        if (!effectiveDates.Contains(employeeInsuredBenefitModel.EffectiveDate.Date))
                        {
                            /// insert new record
                            return await CreatePersonInsuredCategory(employeeInsuredBenefitModel);
                        }
                        else
                        {
                            /// update exesting record??
                            return await UpdatePersonInsuredCategory(employeeInsuredBenefitModel);
                        }
                    }
                    else
                    {
                        return await UpdatePersonInsuredCategory(employeeInsuredBenefitModel);
                    }
                }

                return false;
            }
        }

        private async Task<ChangesOnBenefitCategory> GetChangesOnBenefitCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            var changesOnBenefitCategory = ChangesOnBenefitCategory.None;
            
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personInsuredCategory = await _policyPersonInsuredCategoryRepository.Where(p => p.PersonInsuredCategoryId == employeeInsuredBenefit.PersonInsuredCategoryId).FirstOrDefaultAsync();
                var insuredSumAssured = await _policyInsuredSumAssuredRepository.Where(t => t.InsuredSumAssuredId == employeeInsuredBenefit.InsuredSumAssuredId).FirstOrDefaultAsync();

                if (personInsuredCategory != null)
                {
                    if (personInsuredCategory.BenefitCategoryId != employeeInsuredBenefit.BenefitCategoryId ||
                        personInsuredCategory.EffectiveDate.Date != employeeInsuredBenefit.PersonInsuredCategoryEffectiveDate.Date ||
                        personInsuredCategory.PersonInsuredCategoryStatus != (PersonInsuredCategoryStatusEnum)employeeInsuredBenefit.PersonInsuredCategoryStatusId ||
                        personInsuredCategory.DateJoinedPolicy?.Date != employeeInsuredBenefit.DateJoinedPolicy?.Date)
                    {
                        changesOnBenefitCategory = ChangesOnBenefitCategory.PersonInsuredCategory;
                    }
                }

                if (insuredSumAssured != null)
                {
                    if (insuredSumAssured.EffectiveDate.Date != employeeInsuredBenefit.InsuredSumAssuredEffectiveDate.Date ||
                        insuredSumAssured.AnnualSalary != employeeInsuredBenefit.AnnualSalary ||
                        insuredSumAssured.Premium != employeeInsuredBenefit.Premium ||
                        insuredSumAssured.ActualCoverAmount != employeeInsuredBenefit.ActualCoverAmount ||
                        insuredSumAssured.PotentialCoverAmount != employeeInsuredBenefit.PotentialCoverAmount ||
                        insuredSumAssured.ActualWaiverAmount != employeeInsuredBenefit.ActualWaiverAmount ||
                        insuredSumAssured.PotentialWaiverAmount != employeeInsuredBenefit.PotentialWaiverAmount ||
                        insuredSumAssured.MedicalPremWaiverAmount != employeeInsuredBenefit.MedicalPremWaiverAmount ||
                        insuredSumAssured.ShareOfFund != employeeInsuredBenefit.ShareOfFund
                    )
                    {
                        if (changesOnBenefitCategory == ChangesOnBenefitCategory.PersonInsuredCategory)
                        {
                            changesOnBenefitCategory = ChangesOnBenefitCategory.Both;
                        }
                        else
                        {
                            changesOnBenefitCategory = ChangesOnBenefitCategory.InsuredSumAssured;
                        }
                    }
                }
            }            

            return changesOnBenefitCategory;
        }

        public async Task<bool> UpdateBenefitCategory(EmployeeInsuredCategoryModel employeeInsuredBenefitModel)
        {
            if (employeeInsuredBenefitModel == null) return false;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personInsuredCategory = await _policyPersonInsuredCategoryRepository.Where(p => p.PersonInsuredCategoryId == employeeInsuredBenefitModel.PersonInsuredCategoryId).FirstOrDefaultAsync();

                if (personInsuredCategory != null)
                {
                    if (personInsuredCategory.EffectiveDate == employeeInsuredBenefitModel.EffectiveDate.Date)
                    {
                        personInsuredCategory.RolePlayerTypeId = employeeInsuredBenefitModel.RolePlayerTypeId;
                        personInsuredCategory.BenefitCategoryId = employeeInsuredBenefitModel.BenefitCategoryId;
                        personInsuredCategory.PersonInsuredCategoryStatus = (PersonInsuredCategoryStatusEnum)employeeInsuredBenefitModel.PersonInsuredCategoryStatusId;
                        personInsuredCategory.DateJoinedPolicy = employeeInsuredBenefitModel.DateJoinedPolicy;

                        _policyPersonInsuredCategoryRepository.Update(personInsuredCategory);
                    }
                    else
                    {
                        var newPersonInsuredCategory = new PersonInsuredCategory
                        {
                            PersonId = employeeInsuredBenefitModel.PersonId,
                            BenefitDetailId = employeeInsuredBenefitModel.BenefitDetailId,
                            EffectiveDate = DateTimeHelper.StartOfTheMonth(employeeInsuredBenefitModel.EffectiveDate),
                            RolePlayerTypeId = employeeInsuredBenefitModel.RolePlayerTypeId,
                            BenefitCategoryId = employeeInsuredBenefitModel.BenefitCategoryId,
                            PersonEmploymentId = employeeInsuredBenefitModel.PersonEmploymentId,
                            PersonInsuredCategoryStatus = (PersonInsuredCategoryStatusEnum)employeeInsuredBenefitModel.PersonInsuredCategoryStatusId,
                            DateJoinedPolicy = employeeInsuredBenefitModel.DateJoinedPolicy
                        };

                        var personInsuredCategory_entity = Mapper.Map<policy_PersonInsuredCategory>(newPersonInsuredCategory);
                        _policyPersonInsuredCategoryRepository.Create(personInsuredCategory_entity);                       
                    }                    
                }

                var insuredSumAssured = await _policyInsuredSumAssuredRepository.Where(sum => sum.InsuredSumAssuredId == employeeInsuredBenefitModel.InsuredSumAssuredId).SingleOrDefaultAsync();

                if (insuredSumAssured != null)
                {
                    if (insuredSumAssured.EffectiveDate == employeeInsuredBenefitModel.EffectiveDate.Date)
                    {
                        insuredSumAssured.AnnualSalary = employeeInsuredBenefitModel.AnnualSalary;
                        insuredSumAssured.Premium = employeeInsuredBenefitModel.Premium;
                        insuredSumAssured.ActualCoverAmount = employeeInsuredBenefitModel.ActualCoverAmount;
                        insuredSumAssured.PotentialCoverAmount = employeeInsuredBenefitModel.PotentialCoverAmount;
                        insuredSumAssured.ActualWaiverAmount = employeeInsuredBenefitModel.ActualWaiverAmount;
                        insuredSumAssured.PotentialWaiverAmount = employeeInsuredBenefitModel.PotentialWaiverAmount;
                        insuredSumAssured.MedicalPremWaiverAmount = employeeInsuredBenefitModel.MedicalPremWaiverAmount;
                        insuredSumAssured.ShareOfFund = employeeInsuredBenefitModel.ShareOfFund;

                        _policyInsuredSumAssuredRepository.Update(insuredSumAssured);
                    }

                    else 
                    {
                        var newInsuredSumAssured = new InsuredSumAssured()
                        {
                            PersonId = employeeInsuredBenefitModel.PersonId,
                            BenefitDetailId = employeeInsuredBenefitModel.BenefitDetailId,
                            EffectiveDate = DateTimeHelper.StartOfTheMonth(employeeInsuredBenefitModel.EffectiveDate),
                            AnnualSalary = employeeInsuredBenefitModel.AnnualSalary,
                            Premium = employeeInsuredBenefitModel.Premium,
                            ActualCoverAmount = employeeInsuredBenefitModel.ActualCoverAmount,
                            PotentialCoverAmount = employeeInsuredBenefitModel.PotentialCoverAmount,
                            ActualWaiverAmount = employeeInsuredBenefitModel.ActualWaiverAmount,
                            PotentialWaiverAmount = employeeInsuredBenefitModel.PotentialWaiverAmount,
                            MedicalPremWaiverAmount = employeeInsuredBenefitModel.MedicalPremWaiverAmount,
                            ShareOfFund = employeeInsuredBenefitModel.ShareOfFund
                        };

                        var insuredSumAssured_entity = Mapper.Map<policy_InsuredSumAssured>(newInsuredSumAssured);
                        _policyInsuredSumAssuredRepository.Create(insuredSumAssured_entity);

                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> CreatePersonInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            if (employeeInsuredBenefit == null) return false;

            if (employeeInsuredBenefit.PersonEmploymentId < 0)
                employeeInsuredBenefit.PersonEmploymentId = null;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personInsuredCategory = new PersonInsuredCategory
                {
                    PersonId = employeeInsuredBenefit.PersonId,
                    BenefitDetailId = employeeInsuredBenefit.BenefitDetailId,
                    EffectiveDate = DateTimeHelper.StartOfTheMonth(employeeInsuredBenefit.EffectiveDate),
                    RolePlayerTypeId = employeeInsuredBenefit.RolePlayerTypeId,
                    BenefitCategoryId = employeeInsuredBenefit.BenefitCategoryId,
                    PersonEmploymentId = employeeInsuredBenefit.PersonEmploymentId,
                    PersonInsuredCategoryStatus = (PersonInsuredCategoryStatusEnum)employeeInsuredBenefit.PersonInsuredCategoryStatusId,
                    DateJoinedPolicy = employeeInsuredBenefit.DateJoinedPolicy
                };

                var personInsuredCategory_entity = Mapper.Map<policy_PersonInsuredCategory>(personInsuredCategory);
                _policyPersonInsuredCategoryRepository.Create(personInsuredCategory_entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }                     
        }

        public async Task<bool> UpdatePersonInsuredCategory(EmployeeInsuredCategoryModel employeeInsuredBenefitModel)
        {
            if (employeeInsuredBenefitModel == null) return false;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var personInsuredCategory = await _policyPersonInsuredCategoryRepository.Where(p => p.PersonInsuredCategoryId == employeeInsuredBenefitModel.PersonInsuredCategoryId).FirstOrDefaultAsync();

                if (personInsuredCategory != null)
                {
                    personInsuredCategory.EffectiveDate = employeeInsuredBenefitModel.PersonInsuredCategoryEffectiveDate;
                    personInsuredCategory.RolePlayerTypeId = employeeInsuredBenefitModel.RolePlayerTypeId;
                    personInsuredCategory.BenefitCategoryId = employeeInsuredBenefitModel.BenefitCategoryId;
                    personInsuredCategory.PersonInsuredCategoryStatus = (PersonInsuredCategoryStatusEnum)employeeInsuredBenefitModel.PersonInsuredCategoryStatusId;
                    personInsuredCategory.DateJoinedPolicy = employeeInsuredBenefitModel.DateJoinedPolicy;

                    _policyPersonInsuredCategoryRepository.Update(personInsuredCategory);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> CreateInsuredSumAssured(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            if (employeeInsuredBenefit == null) return false;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var insuredSumAssured = new InsuredSumAssured()
                {
                    PersonId = employeeInsuredBenefit.PersonId,
                    BenefitDetailId = employeeInsuredBenefit.BenefitDetailId,
                    EffectiveDate = DateTimeHelper.StartOfTheMonth(employeeInsuredBenefit.EffectiveDate),
                    AnnualSalary = employeeInsuredBenefit.AnnualSalary,
                    Premium = employeeInsuredBenefit.Premium,
                    ActualCoverAmount = employeeInsuredBenefit.ActualCoverAmount,
                    PotentialCoverAmount = employeeInsuredBenefit.PotentialCoverAmount,
                    ActualWaiverAmount = employeeInsuredBenefit.ActualWaiverAmount,
                    PotentialWaiverAmount = employeeInsuredBenefit.PotentialWaiverAmount,
                    MedicalPremWaiverAmount = employeeInsuredBenefit.MedicalPremWaiverAmount,
                    ShareOfFund = employeeInsuredBenefit.ShareOfFund
                };

                var insuredSumAssured_entity = Mapper.Map<policy_InsuredSumAssured>(insuredSumAssured);
                _policyInsuredSumAssuredRepository.Create(insuredSumAssured_entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<bool> UpdateInsuredSumAssured(EmployeeInsuredCategoryModel employeeInsuredBenefitModel)
        {
            if (employeeInsuredBenefitModel == null) return false;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var insuredSumAssured = await _policyInsuredSumAssuredRepository.Where(sum => sum.InsuredSumAssuredId == employeeInsuredBenefitModel.InsuredSumAssuredId).SingleOrDefaultAsync();

                if (insuredSumAssured != null)
                {
                    insuredSumAssured.EffectiveDate = employeeInsuredBenefitModel.InsuredSumAssuredEffectiveDate;
                    insuredSumAssured.AnnualSalary = employeeInsuredBenefitModel.AnnualSalary;
                    insuredSumAssured.Premium = employeeInsuredBenefitModel.Premium;
                    insuredSumAssured.ActualCoverAmount = employeeInsuredBenefitModel.ActualCoverAmount;
                    insuredSumAssured.PotentialCoverAmount = employeeInsuredBenefitModel.PotentialCoverAmount;
                    insuredSumAssured.ActualWaiverAmount = employeeInsuredBenefitModel.ActualWaiverAmount;
                    insuredSumAssured.PotentialWaiverAmount = employeeInsuredBenefitModel.PotentialWaiverAmount;
                    insuredSumAssured.MedicalPremWaiverAmount = employeeInsuredBenefitModel.MedicalPremWaiverAmount;
                    insuredSumAssured.ShareOfFund = employeeInsuredBenefitModel.ShareOfFund;

                    _policyInsuredSumAssuredRepository.Update(insuredSumAssured);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        private DateTime GetBenefitCategoryEffectiveDate(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            if (employeeInsuredBenefit.PersonInsuredCategoryEffectiveDate >= employeeInsuredBenefit.InsuredSumAssuredEffectiveDate)
            {
                return employeeInsuredBenefit.PersonInsuredCategoryEffectiveDate;
            }
            else
            {
                return employeeInsuredBenefit.InsuredSumAssuredEffectiveDate;
            }
        }

        private bool IsBenefitCategoryEffectiveDateChanged(EmployeeInsuredCategoryModel employeeInsuredBenefit)
        {
            return employeeInsuredBenefit.EffectiveDate != GetBenefitCategoryEffectiveDate(employeeInsuredBenefit) ? true : false;
        }

        public async Task<List<DateTime>> GetInsuredCategoryEffectiveDates(int employeeRolePlayerId, int personEmploymentId, int rolePlayerType, int benefitDetailId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                int? _personEmploymentId = null; 
                if (personEmploymentId > 0)
                {
                    _personEmploymentId = personEmploymentId;
                }

                var personInsuredCategoryEffectiveDates = await _policyPersonInsuredCategoryRepository.Where(p => p.PersonId == employeeRolePlayerId
                                                                                        && p.PersonEmploymentId == _personEmploymentId
                                                                                        && p.RolePlayerTypeId == (int)rolePlayerType
                                                                                        && p.BenefitDetailId == benefitDetailId)
                                                                                    .Select(s => s.EffectiveDate).ToListAsync();

                var insuredSumAssuredEffectiveDates = await _policyInsuredSumAssuredRepository.Where(s => s.PersonId == employeeRolePlayerId
                                                                                && s.BenefitDetailId == benefitDetailId).
                                                                                Select(s => s.EffectiveDate).ToListAsync();

                var effectiveDates = personInsuredCategoryEffectiveDates;
                effectiveDates.AddRange(insuredSumAssuredEffectiveDates);
                return effectiveDates.Distinct().ToList();
            }
        }

        public async Task<List<DateTime>> GetPersonInsuredCategoryEffectiveDates(int employeeRolePlayerId, int personEmploymentId, int rolePlayerTypeId, int benefitDetailId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                int? _personEmploymentId = null;
                if (personEmploymentId > 0)
                {
                    _personEmploymentId = personEmploymentId;
                }

                var personInsuredCategoryEffectiveDates = await _policyPersonInsuredCategoryRepository.Where(p => p.PersonId == employeeRolePlayerId
                                                                                        && p.PersonEmploymentId == _personEmploymentId
                                                                                        && p.RolePlayerTypeId == rolePlayerTypeId
                                                                                        && p.BenefitDetailId == benefitDetailId)
                                                                                    .Select(s => s.EffectiveDate).ToListAsync();
                          

                return personInsuredCategoryEffectiveDates;
            }
        }

        public async Task<List<DateTime>> GetInsuredSumAssuredEffectiveDates(int employeeRolePlayerId, int benefitDetailId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                 var insuredSumAssuredEffectiveDates = await _policyInsuredSumAssuredRepository.Where(s => s.PersonId == employeeRolePlayerId
                                                                               && s.BenefitDetailId == benefitDetailId).
                                                                               Select(s => s.EffectiveDate).ToListAsync(); ;


                return insuredSumAssuredEffectiveDates;
            }
        }

        public async Task<bool> RollForwardBenefitPayrolls(DateTime? nextPayrollEffectiveDate)
        {
            using (_dbContextScopeFactory.Create())
            {
                try
                {
                    await _policyRepository.ExecuteSqlCommandAsync(DatabaseConstants.RollForwardBenefitPayroll,
                        new SqlParameter("@nextPayrollEffectiveDate", DBNull.Value),
                        new SqlParameter("@UserID", RmaIdentity.Username));

                    await _policyRepository.ExecuteSqlCommandAsync(DatabaseConstants.GroupRiskInvoiceToPending,
                        new SqlParameter("@UserID", RmaIdentity.Username),
                        new SqlParameter("@InvoiceID", DBNull.Value),
                        new SqlParameter("@PolicyID", DBNull.Value)
                        );

                    return true;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                    throw new BusinessException(ex.Message);
                }
            }
        }

        public async Task<List<Lookup>> GetFuneralInsuredTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _funeralInsuredTypeRepository.Select(f => new Lookup
                {
                    Id = f.FuneralInsuredTypeId,
                    Name = f.Name,
                    Description = f.Name
                }).ToListAsync();
            }
        }
    }
}
