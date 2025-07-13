using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

using TinyCsvParser;
using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Services.Product
{
    public class ProductOptionFacade : RemotingStatelessService, IProductOptionService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditWriter _productAuditWriter;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IRepository<product_ProductOptionCoverType> _productOptionCoverTypeRepository;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<broker_Brokerage> _brokerageRepository;
        private readonly IRepository<product_ProductOptionRule> _productOptionRuleRepository;
        private readonly IRepository<broker_FscaLicenseCategory> _brokerFscaLicenseCategoryRepository;
        private readonly IRepository<product_ProductOptionDependency> _productOptionDependecyRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<product_ProductOptionPaymentFrequency> _productOptionPaymentFrequenciesRepository;
        private readonly IRepository<product_BenefitRate> _productBenefitRateRepository;
        private readonly IRepository<product_Template> _templateRepository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<product_ProductOptionBillingIntegration> _productOptionBillingIntegrationRepository;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public ProductOptionFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_ProductOption> productOptionRepository,
            IRepository<product_Benefit> benefitRepository,
            IAuditWriter productAuditWriter,
            IRepository<product_Product> productRepository,
            IRepository<broker_Brokerage> brokerageRepository,
            IRepository<broker_FscaLicenseCategory> brokerFscaLicenseCategoryRepository,
            IRepository<product_ProductOptionCoverType> productOptionCoverTypeRepository,
            IRepository<product_ProductOptionRule> productOptionRuleRepository,
            IConfigurationService configurationService,
            IRepository<product_ProductOptionDependency> productOptionDependecyRepository,
            IRepository<product_ProductOptionPaymentFrequency> productOptionPaymentFrequenciesRepository,
            IRepository<product_BenefitRate> productBenefitRateRepository,
            IRepository<product_Template> templateRepository,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<product_ProductOptionBillingIntegration> productOptionBillingIntegrationRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _productOptionRepository = productOptionRepository;
            _benefitRepository = benefitRepository;
            _productAuditWriter = productAuditWriter;
            _productRepository = productRepository;
            _brokerageRepository = brokerageRepository;
            _brokerFscaLicenseCategoryRepository = brokerFscaLicenseCategoryRepository;
            _productOptionCoverTypeRepository = productOptionCoverTypeRepository;
            _productOptionRuleRepository = productOptionRuleRepository;
            _configurationService = configurationService;
            _productOptionDependecyRepository = productOptionDependecyRepository;
            _productOptionPaymentFrequenciesRepository = productOptionPaymentFrequenciesRepository;
            _productBenefitRateRepository = productBenefitRateRepository;
            _templateRepository = templateRepository;
            _documentGeneratorService = documentGeneratorService;
            _productOptionBillingIntegrationRepository = productOptionBillingIntegrationRepository;
        }

        public async Task<int> AddProductOption(ProductOption productOption)
        {
            Contract.Requires(productOption != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddProductOption);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_ProductOption>(productOption);

                if (productOption.BenefitsIds != null && productOption.BenefitsIds.Count > 0)
                    entity.Benefits = _benefitRepository.Where(b => productOption.BenefitsIds.Contains(b.Id)).ToList();

                if (productOption.CoverTypeIds != null && productOption.CoverTypeIds.Count > 0)
                    entity.CoverType = productOption.CoverTypeIds.FirstOrDefault();
                entity.ProductOptionCoverTypes = productOption.CoverTypeIds.Select(n => new product_ProductOptionCoverType() { CoverType = n }).ToList();

                if (productOption.PaymentFrequencyIds != null && productOption.PaymentFrequencyIds.Count > 0)
                    entity.ProductOptionPaymentFrequencies = productOption.PaymentFrequencyIds.Select(n => new product_ProductOptionPaymentFrequency() { PaymentFrequency = n }).ToList();

                entity.ProductOptionRules = productOption.RuleItems.Select(pr => new product_ProductOptionRule()
                {
                    RuleId = pr.RuleId,
                    RuleConfiguration = pr.RuleConfiguration,
                }).ToList();

                var result = _productOptionRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _productAuditWriter.AddLastViewed<product_ProductOption>(result.Id);

                return result.Id;
            }
        }

        public async Task EditProductOption(ProductOption productOption)
        {
            Contract.Requires(productOption != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditProductOption);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_ProductOption>(productOption);

                await _productOptionRepository.LoadAsync(entity, r => r.ProductOptionPaymentFrequencies);
                entity.ProductOptionPaymentFrequencies = GetPaymentFrequencies(entity.Id, productOption.PaymentFrequencyIds);

                await _productOptionRepository.LoadAsync(entity, r => r.ProductOptionCoverTypes);
                entity.ProductOptionCoverTypes = GetCoverOptionTypes(entity.Id, productOption.CoverTypeIds);

                await _productOptionRepository.LoadAsync(entity, r => r.Benefits);
                entity.Benefits = await GetProductOptionBenefits(productOption.BenefitsIds);

                entity.ProductOptionRules = null;
                await UpdateProductOptionRules(entity.Id, productOption.RuleItems);

                _productOptionRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                if (entity.ProductOptionRules != null)
                {
                    entity.ProductOptionRules.Clear();
                    entity.ProductOptionRules = Mapper.Map<List<product_ProductOptionRule>>(productOption.RuleItems);
                }

                await _productAuditWriter.AddLastViewed<product_ProductOption>(entity.Id);
            }
        }

        private async Task UpdateProductOptionRules(int productOptionId, List<RuleItem> ruleItems)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var productOptionRules = await _productOptionRuleRepository
                    .Where(por => por.ProductOptionId == productOptionId)
                    .ToListAsync();
                // Update existing rules
                foreach (var rule in productOptionRules)
                {
                    var ruleItem = ruleItems.FirstOrDefault(ri => ri.Id == rule.Id);
                    if (ruleItem is null)
                    {
                        rule.IsDeleted = true;
                    }
                    else
                    {
                        rule.IsDeleted = ruleItem.IsDeleted;
                        rule.RuleConfiguration = ruleItem.RuleConfiguration;
                    }
                    rule.ModifiedBy = RmaIdentity.Email;
                    rule.ModifiedDate = DateTimeHelper.SaNow;
                    _productOptionRuleRepository.Update(rule);
                }
                // Add new rules
                foreach (var ruleItem in ruleItems)
                {
                    if (ruleItem.Id == 0)
                    {
                        var rule = new product_ProductOptionRule
                        {
                            ProductOptionId = productOptionId,
                            RuleId = ruleItem.RuleId,
                            RuleConfiguration = ruleItem.RuleConfiguration,
                            IsDeleted = false,
                            CreatedBy = RmaIdentity.Email,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedBy = RmaIdentity.Email,
                            ModifiedDate = DateTimeHelper.SaNow
                        };
                        _productOptionRuleRepository.Create(rule);
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task<ICollection<product_Benefit>> GetProductOptionBenefits(List<int> benefitIds)
        {
            if (benefitIds is null || benefitIds.Count == 0)
                return new List<product_Benefit>();
            return await _benefitRepository
                .Where(b => benefitIds.Contains(b.Id))
                .ToListAsync();
        }

        public async Task<List<Benefit>> GetBenefitsByBenefitIdsOnly(List<int> benefitIds)
        {
            if (benefitIds ==null || benefitIds.Count == 0)
            {
                return new List<Benefit>();
            }
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _benefitRepository.Where(b => benefitIds.Contains(b.Id)).ToListAsync();

                return Mapper.Map<List<Benefit>>(entities);
            }
        }

        private List<product_ProductOptionCoverType> GetCoverOptionTypes(int productOptionId, List<CoverTypeEnum> coverTypeIds)
        {
            if (coverTypeIds is null || coverTypeIds.Count == 0)
                return new List<product_ProductOptionCoverType>();
            return coverTypeIds.Select(
                n => new product_ProductOptionCoverType()
                {
                    ProductOptionId = productOptionId,
                    CoverType = n
                })
                .Distinct()
                .ToList();
        }

        private List<product_ProductOptionPaymentFrequency> GetPaymentFrequencies(int productOptionId, List<PaymentFrequencyEnum> paymentFrequencyIds)
        {
            if (paymentFrequencyIds is null || paymentFrequencyIds.Count == 0)
                return new List<product_ProductOptionPaymentFrequency>();
            return paymentFrequencyIds.Select(
                n => new product_ProductOptionPaymentFrequency()
                {
                    ProductOptionId = productOptionId,
                    PaymentFrequency = n
                })
                .Distinct()
                .ToList();
        }

        public async Task<List<ProductOption>> GetProductOptionNamesByProductId(int productId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            // Lite lookup function for policy wizards
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository
                    .Where(productOption => productOption.ProductId == productId
                                         && !productOption.IsDeleted)
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                data.ForEach(po =>
                {
                    var productOptionCoverType = new product_ProductOptionCoverType
                    {
                        ProductOptionId = po.Id,
                        CoverType = po.CoverType
                    };
                    po.ProductOptionCoverTypes = new List<product_ProductOptionCoverType>()
                    {
                        productOptionCoverType
                    };
                });
                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsByProductId(int productId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            var results = new List<ProductOption>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository
                    .Where(productOption => !productOption.IsDeleted && productOption.ProductId == productId)
                    .ToListAsync();
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionCoverTypes);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionRules);
                foreach (var entity in data)
                {
                    var option = Mapper.Map<ProductOption>(entity);
                    option.CoverTypeIds = entity.ProductOptionCoverTypes.Select(s => s.CoverType).ToList();
                    option.RuleItems = entity.ProductOptionRules.Select(productRule => new RuleItem()
                    {
                        RuleConfiguration = productRule.RuleConfiguration?.Replace("\"", "\'"),
                        RuleId = productRule.RuleId,
                        Id = productRule.Id
                    }).ToList();
                    results.Add(option);
                }

                var productIds = results.Select(d => d.ProductId).ToList();

                var products = _productRepository.Where(c => productIds.Contains(c.Id)).ToList();
                results.ForEach(c => c.Product = Mapper.Map<Contracts.Entities.Product.Product>(products.FirstOrDefault(d => d.Id == c.ProductId)));

                return results;
            }
        }

        public async Task<ProductOption> GetProductOption(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.SingleAsync(s => s.Id == id, $"Could not find a product option with the id {id}");
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionRules);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionNotes);
                await _productOptionRepository.LoadAsync(data, d => d.Benefits);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionPaymentFrequencies);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionCoverTypes);
                await _productOptionRepository.LoadAsync(data, d => d.Product);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionDependencies);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionAllowanceTypes);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionBillingIntegrations);

                await _productAuditWriter.AddLastViewed<product_ProductOption>(id);

                var option = Mapper.Map<ProductOption>(data);

                option.RuleItems = data.ProductOptionRules.Select(productRule => new RuleItem()
                {
                    RuleConfiguration = productRule.RuleConfiguration?.Replace("\"", "\'"),
                    RuleId = productRule.RuleId,
                    Id = productRule.Id
                }).ToList();

                option.CoverTypeIds = data.ProductOptionCoverTypes.Select(s => s.CoverType).ToList();
                option.PaymentFrequencyIds = data.ProductOptionPaymentFrequencies.Select(s => s.PaymentFrequency).ToList();

                var dependency = await _productOptionDependecyRepository.Where(s => s.ProductOptionId == option.Id).ToListAsync();
                option.ProductOptionDependencies = Mapper.Map<List<ProductOptionDependency>>(dependency);

                return option;
            }
        }

        public async Task<List<ProductOption>> GetProductOptions()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.ToListAsync();
                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsIncludeDeleted()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _productOptionRepository.DisableFilter("SoftDeletes");
                var data = await _productOptionRepository.ToListAsync();
                _productOptionRepository.EnableFilter("SoftDeletes");

                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsByIdsForDeclarations(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.Where(c => ids.Contains(c.Id)).ToListAsync();
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionAllowanceTypes);
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionDependencies);

                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsWithAllowanceTypes()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.ToListAsync();
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionAllowanceTypes);

                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsWithDependencies()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.ToListAsync();
                await _productOptionRepository.LoadAsync(data, d => d.ProductOptionDependencies);

                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<CoverTypeEnum> GetCoverTypeByProductOptionId(int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _productOptionCoverTypeRepository.FirstOrDefaultAsync(p => p.ProductOptionId == productOptionId);
                return result != null ? result.CoverType : CoverTypeEnum.IndividualVoluntary; // SET A DEFAULT IF THERE IS NO COVERTYPE : NEEDS TO BE VERIFIED
            }
        }

        public async Task<bool> CheckIfBenefitExist(int productOptionId, string benefitRule)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptions = await _productOptionRepository.FirstOrDefaultAsync(p => p.Id == productOptionId);
                await _productOptionRepository.LoadAsync(productOptions, a => a.Benefits);
                foreach (var benefit in productOptions.Benefits)
                {
                    await _benefitRepository.LoadAsync(benefit, b => b.BenefitRules);
                    if (benefit.BenefitRules.Any(r => r.RuleConfiguration.Contains(benefitRule)))
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        public async Task RemoveProductOption(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditProductOption);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataProductOption = await _productOptionRepository.SingleAsync(s => s.Id == id,
                    $"Could not find a product option with the id {id}");

                _productOptionRepository.Delete(dataProductOption);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PagedRequestResult<ProductOption>> SearchProductOptions(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptions = await _productOptionRepository
                    .Where(product => string.IsNullOrEmpty(request.SearchCriteria)
                    || product.Name.Contains(request.SearchCriteria)
                    || product.Description.Contains(request.SearchCriteria)
                    || product.Code.Contains(request.SearchCriteria)
                    )
                    .ToPagedResult<product_ProductOption, ProductOption>(request);

                return productOptions;
            }
        }

        public async Task<List<Benefit>> GetCoverMemberTypeBenefitsForProductOption(int productOptionId, CoverMemberTypeEnum coverMemberType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _benefitRepository
                    .Where(b => !b.IsDeleted
                        && b.CoverMemberType == coverMemberType
                        && b.ProductOptions.Any(po => po.Id == productOptionId))
                    .ToListAsync();
                return await LoadBenefitData(data);
            }
        }

        public async Task<List<Benefit>> GetBenefitsByBenefitIds(int productOptionId, List<int> benefitIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _benefitRepository
                    .Where(b => !b.IsDeleted
                        && b.ProductOptions.Any(po => po.Id == productOptionId)
                        && benefitIds.Contains(b.Id))
                    .ToListAsync();
                return await LoadBenefitData(data);
            }
        }

        public async Task<List<BenefitModel>> GetBenefitsForProductOption(int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    // Use a stored procedure, because the code to add premiums, cover amounts and
                    // age range takes too long to load. This procedure includes everything.
                    var benefits = await _benefitRepository
                        .SqlQueryAsync<BenefitModel>(DatabaseConstants.GetCoverMemberTypeBenefitsForProductOption,
                            new SqlParameter("@productOptionId", productOptionId),
                            new SqlParameter("@coverMemberTypeId", DBNull.Value)
                        );
                    return benefits;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                    throw;
                }
            }
        }

        public async Task<List<BenefitModel>> GetBenefitsForProductOptionAndCoverType(int productOptionId, int coverMemberTypeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // Use a stored procedure, because the code to add premiums, cover amounts and
                // age range takes too long to load. This procedure includes everything.
                var benefits = await _benefitRepository
                    .SqlQueryAsync<BenefitModel>(DatabaseConstants.GetCoverMemberTypeBenefitsForProductOption,
                        new SqlParameter("@productOptionId", productOptionId),
                        new SqlParameter("@coverMemberTypeId", coverMemberTypeId)
                    );
                return benefits;
            }
        }

        public async Task<List<Benefit>> GetBenefitsForOptionAndBenefits(int productOptionId, List<int> benefitIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _benefitRepository
                    .Where(b => b.ProductOptions.Any(po => po.Id == productOptionId)
                             && (benefitIds.Contains(b.Id) || b.BenefitType == BenefitTypeEnum.Additional)
                    )
                    .ToListAsync();
                return await LoadBenefitData(data);
            }
        }

        public async Task<List<Benefit>> GetBenefitsForOption(int productOptionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _benefitRepository
                    .Where(b => !b.IsDeleted
                        && b.ProductOptions.Any(po => po.Id == productOptionId))
                    .ToListAsync();
                return await LoadBenefitData(data);
            }
        }

        private async Task<List<Benefit>> LoadBenefitData(List<product_Benefit> data)
        {
            var benefits = new List<Benefit>();
            if (data != null && data.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
                {
                    await _benefitRepository.LoadAsync(data, d => d.BenefitRates);
                    await _benefitRepository.LoadAsync(data, d => d.BenefitRules);

                    benefits = Mapper.Map<List<Benefit>>(data);

                    foreach (var benefit in benefits)
                    {
                        if (benefit.BenefitRates != null)
                        {
                            benefit.BenefitRates = benefit.BenefitRates
                                .Where(r => r.EffectiveDate <= DateTime.Today)
                                .OrderByDescending(r => r.EffectiveDate)
                                .Take(1)
                                .ToList();
                        }

                        var rules = data.FirstOrDefault(b => b.Id == benefit.Id)?.BenefitRules;
                        benefit.RuleItems = new List<RuleItem>();
                        if (rules != null)
                        {
                            foreach (var ruleItem in rules)
                            {
                                benefit.RuleItems.Add(
                                    new RuleItem
                                    {
                                        RuleConfiguration = ruleItem.RuleConfiguration?.Replace("\"", "\'"),
                                        RuleId = ruleItem.RuleId,
                                        Id = ruleItem.Id
                                    }
                                );
                            }
                        }
                    }
                }
            }
            return benefits;
        }

        public async Task<PagedRequestResult<ProductOption>> GetBrokerProductOptions(PagedRequest request)
        {
            Contract.Requires(request != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            var brokerageId = int.Parse(request.SearchCriteria);

            var result = await GetPagedBrokerProductOptions(request, brokerageId);
            return result;
        }

        public async Task<PagedRequestResult<ProductOption>> GetBrokerProductOptionsByProductId(PagedRequest request)
        {
            Contract.Requires(request != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            NameValueCollection searchCriteriaCollection = HttpUtility.ParseQueryString(request.SearchCriteria);
            var brokerageId = int.Parse(searchCriteriaCollection["brokerageId"]);
            var productId = int.Parse(searchCriteriaCollection["productId"]);

            var result = await GetPagedBrokerProductOptions(request, brokerageId, productId);
            return result;
        }

        private async Task<PagedRequestResult<ProductOption>> GetPagedBrokerProductOptions(PagedRequest request, int brokerageId, int productId = -1)
        {
            Contract.Requires(request!=null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var broker = await _brokerageRepository.SingleAsync(s => s.Id == brokerageId, $"Could not find a brokerage with the id {brokerageId}");
                await _brokerageRepository.LoadAsync(broker, d => d.BrokerageFscaLicenseCategories);

                var licenCategoryIds = broker.BrokerageFscaLicenseCategories.Where(c => !c.IsDeleted).Select(c => c.FscaLicenseCategoryId).ToList();
                var productClasses = _brokerFscaLicenseCategoryRepository.Where(c => licenCategoryIds.Contains(c.Id)).Select(c => c.ProductClass).ToList();

                var productOptions = await _productOptionRepository
                    .Where(c => !c.IsDeleted && productClasses.Contains(c.Product.ProductClass) && (c.ProductId == productId || productId == -1))
                    .ToPagedResult<product_ProductOption, ProductOption>(request);

                var options = productOptions.Data;
                var productIds = options.Select(d => d.ProductId).ToList();

                var products = _productRepository.Where(c => productIds.Contains(c.Id)).ToList();
                productOptions.Data.ForEach(c => { c.Product = Mapper.Map<Contracts.Entities.Product.Product>(products.FirstOrDefault(d => d.Id == c.ProductId)); });

                return productOptions;
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsByIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.Where(c => ids.Contains(c.Id)).ToListAsync();
                var options = Mapper.Map<List<ProductOption>>(data);

                return options;
            }
        }

        public async Task<List<Benefit>> GetBenefitsForExtendedMembers(int mainMemberOptionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBenefit);

            var results = new List<Benefit>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var benefits = await GetBenefitsForOption(mainMemberOptionId);

                foreach (var benefit in benefits)
                {
                    benefit.BenefitBaseRateLatest = benefit.BenefitRates.OrderByDescending(r => r.EffectiveDate)
                        .Select(r => r.BaseRate).FirstOrDefault();
                    benefit.BenefitRateLatest = benefit.BenefitRates.OrderByDescending(r => r.EffectiveDate)
                        .Select(r => r.BenefitAmount).FirstOrDefault();
                }

                foreach (var benefit in benefits)
                {
                    if (benefit.CoverMemberType == CoverMemberTypeEnum.ExtendedFamily)
                    {
                        var result = benefit;

                        var entity = await _benefitRepository
                            .SingleAsync(s => s.Id == benefit.Id);

                        await _benefitRepository.LoadAsync(entity, d => d.BenefitRules);

                        result.RuleItems = entity.BenefitRules.Select(productRule => new RuleItem()
                        {
                            RuleConfiguration = productRule.RuleConfiguration?.Replace("\"", "\'"),
                            RuleId = productRule.RuleId,
                            Id = productRule.Id
                        }).ToList();

                        results.Add(result);
                    }
                }

                return results;
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsByCoverTypeIds(List<int> coverTypes)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);
            var result = new List<ProductOption>();
            if (coverTypes!=null && coverTypes.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var productOptions = new List<product_ProductOption>();

                    var productOptionIds = await _productOptionCoverTypeRepository.Where(o => coverTypes.Contains((int)o.CoverType)).Select(a => a.ProductOptionId).ToListAsync();
                    productOptions = await _productOptionRepository.Where(p => productOptionIds.Contains(p.Id)).ToListAsync();

                    result= Mapper.Map<List<ProductOption>>(productOptions);
                }
            }
            return result;
        }

        public async Task<List<ProductOptionCoverType>> GetProductOptionCoverTypeByproductOptionId(int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptionCoverType = await _productOptionCoverTypeRepository.Where(s => s.ProductOptionId == productOptionId).ToListAsync();


                return Mapper.Map<List<ProductOptionCoverType>>(productOptionCoverType);
            }
        }

        public async Task<Contracts.Entities.Product.Product> GetProductByProductOptionId(int productOptionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOption = await _productOptionRepository
                    .SingleAsync(p => p.Id == productOptionId);
                await _productOptionRepository.LoadAsync(productOption, p => p.Product);
                await _productRepository.LoadAsync(productOption.Product, p => p.ProductBankAccounts);
                return Mapper.Map<Contracts.Entities.Product.Product>(productOption.Product);
            }
        }

        public async Task<List<string>> GetProductOptionWithAllOption()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptions = await _productOptionRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetProductOptionWithAllOption);

                return productOptions;
            }
        }

        public async Task<List<ProductOptionDependency>> GetProductOptionDependecies(int parentOptionId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var dependencies = Mapper.Map<List<ProductOptionDependency>>(await _productOptionDependecyRepository
                  .Where(s => s.ProductOptionId == parentOptionId)
                  .ToListAsync());

                return dependencies;
            }

        }

        public async Task<List<ProductOptionPaymentFrequency>> GetProductOptionPaymentFrequency(int productOptionId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var x = await _productOptionPaymentFrequenciesRepository.Where(s => s.ProductOptionId == productOptionId).ToListAsync();
                return Mapper.Map<List<ProductOptionPaymentFrequency>>(x);
            }
        }
        public async Task<BenefitRate> GetBenefitRate(int benefitId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _productBenefitRateRepository.FirstOrDefaultAsync(b => b.BenefitId == benefitId);
                return Mapper.Map<BenefitRate>(entity);
            }
        }

        public async Task<List<Template>> GetTemplates()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _templateRepository.ToListAsync();
                return Mapper.Map<List<Template>>(entity);
            }
        }

        public async Task<Template> GetTemplate(int templateId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _templateRepository.FirstOrDefaultAsync(template => template.TemplateId == templateId);
                return Mapper.Map<Template>(entity);
            }
        }

        public async Task<int> ImportBenefits(BenefitImportRequest request)
        {
            Contract.Requires(request != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                // Read the list of new benefits
                var benefits = GetBenefitList(request.Content);
                // Check if there are read errors, and raise the first one
                var error = benefits.FirstOrDefault(b => !b.IsValid);
                if (error != null)
                {
                    throw new Exception($"Error in row {error.RowIndex} on column {error.Error.ColumnIndex}: {error.Error.Value}");
                }
                // Assign benefit codes
                var nextNumber = await _documentGeneratorService.GetNextDocumentNumber(DocumentNumberTypeEnum.Benefit);
                foreach (var benefit in benefits)
                {
                    benefit.Result.BenefitCode = $"BEN:{nextNumber:00000}";
                    nextNumber++;
                }
                await _documentGeneratorService.SetNextDocumentNumber(DocumentNumberTypeEnum.Benefit, nextNumber);
                // Create the product option
                var productOptionCode = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.ProductOption, "");
                var productOption = new product_ProductOption
                {
                    ProductId = request.ProductId,
                    Name = request.ProductOptionName,
                    StartDate = request.EffectiveDate.ToSaDateTime(),
                    IsDeleted = false,
                    MaxAdminFeePercentage = request.AdminFee,
                    MaxCommissionFeePercentage = request.Commission,
                    MaxBinderFeePercentage = request.BinderFee,
                    Code = productOptionCode,
                    CoverType = request.CoverType,
                    Benefits = new List<product_Benefit>(),
                    ProductOptionRules = new List<product_ProductOptionRule>
                    {
                        new product_ProductOptionRule
                        {
                            ProductOptionId = 0,
                            RuleId = 5,
                            RuleConfiguration = string.Concat("[{\"id\":0,\"ruleId\":5,\"fieldName\":\"Waiting Period (In Months)\",\"fieldType\":\"number\",\"fieldValue\":\"", request.WaitingPeriod, "\",\"fieldDescription\":\"Waiting Period (In Months)\"}]"),
                            IsDeleted = false
                        }
                    },
                    ProductOptionCoverTypes = new List<product_ProductOptionCoverType>
                    {
                        new product_ProductOptionCoverType
                        {
                            ProductOptionId = 0,
                            CoverType = request.CoverType
                        }
                    }
                };
                // Create the benefits
                foreach (var benefit in benefits)
                {
                    var benefitData = new product_Benefit
                    {
                        Name = $"{benefit.Result.BenefitName} ({benefit.Result.BenefitOption}) {benefit.Result.MemberOption}@{benefit.Result.OptionValue}",
                        Code = benefit.Result.BenefitCode,
                        StartDate = request.EffectiveDate.ToSaDateTime(),
                        IsCaptureEarnings = false,
                        IsAddBeneficiaries = false,
                        IsMedicalReportRequired = false,
                        ProductId = request.ProductId,
                        BenefitType = BenefitTypeEnum.Basic,
                        CoverMemberType = GetCoverMemberType(benefit.Result.MemberType),
                        IsDeleted = false
                    };
                    benefitData.BenefitRules = new List<product_BenefitRule> {
                        new product_BenefitRule {
                            BenefitId = 0,
                            RuleId = 12,
                            RuleConfiguration = string.Concat("[{\"id\":1,\"ruleId\":12,\"fieldName\":\"Minimum Entry Age (Years)\",\"fieldType\":\"number\",\"fieldValue\":\"", benefit.Result.MinimumAge,"\",\"fieldDescription\":\"Minimum Entry Age (Years)\"}]"),
                            IsDeleted = false
                        },
                        new product_BenefitRule {
                            BenefitId = 0,
                            RuleId = 11,
                            RuleConfiguration = string.Concat("[{\"id\":1,\"ruleId\":11,\"fieldName\":\"Maximum Entry Age (Years)\",\"fieldType\":\"number\",\"fieldValue\":\"", benefit.Result.MaximumAge,"\",\"fieldDescription\":\"Maximum Entry Age (Years)\"}]"),
                            IsDeleted = false
                        }
                    };
                    benefitData.BenefitRates = new List<product_BenefitRate>
                    {
                        new product_BenefitRate
                        {
                            BenefitId = 0,
                            BaseRate = benefit.Result.BaseRate,
                            BenefitAmount = benefit.Result.CoverAmount,
                            EffectiveDate = request.EffectiveDate.ToSaDateTime(),
                            IsDeleted = false
                        }
                    };
                    productOption.Benefits.Add(benefitData);
                }
                // Save the product option
                _productOptionRepository.Create(productOption);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return productOption.Benefits.Count;
            }
        }

        private CoverMemberTypeEnum GetCoverMemberType(string memberType)
        {
            switch (memberType)
            {
                case "M": return CoverMemberTypeEnum.MainMember;
                case "S": return CoverMemberTypeEnum.Spouse;
                case "C": return CoverMemberTypeEnum.Child;
                default: return CoverMemberTypeEnum.ExtendedFamily;
            }
        }

        private List<CsvMappingResult<BenefitImport>> GetBenefitList(string content)
        {
            const char delimiter = '|';
            const string newLine = ",";
            const int StartingIndex = 0;
            var decodedString = Convert.FromBase64String(content);
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            fileData = fileData.Trim(new char[] { '[', ']' });
            fileData = fileData.Replace("\"", "");
            var csvParserOptions = new CsvParserOptions(false, delimiter);
            var csvMapper = new BenefitImportMapping();
            var csvParser = new CsvParser<BenefitImport>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var list = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();
            return list;
        }

        public async Task<List<ProductOption>> GetProductOptionsByProductIds(List<int> productIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionRepository.Where(c => productIds.Contains(c.ProductId)).ToListAsync();
                var options = Mapper.Map<List<ProductOption>>(data);

                return options;
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsThatAccumulatesInterest()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProductOption);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionBillingIntegrationRepository
                    .Where(o => o.AccumulatesInterest != null && (bool)o.AccumulatesInterest)
                    .Select(c => c.ProductOption).ToListAsync();
                return Mapper.Map<List<ProductOption>>(data);
            }
        }

        public async Task<ProductCategoryTypeEnum> GetProductCategoryType(int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOption = await _productOptionRepository.FirstOrDefaultAsync(s => s.Id == productOptionId);
                await _productOptionRepository.LoadAsync(productOption, p => p.Product);

                if ((productOption.Product.ProductClass == ProductClassEnum.Life || productOption.Product.ProductClass == ProductClassEnum.ValuePlus) && (UnderwriterEnum)productOption.Product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
                {
                    return ProductCategoryTypeEnum.Funeral;
                }
                else if (productOption.Product.ProductClass == ProductClassEnum.Assistance || productOption.Product.ProductClass == ProductClassEnum.NonStatutory && (UnderwriterEnum)productOption.Product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
                {
                    return productOption.Product.ProductClass == ProductClassEnum.Assistance ? ProductCategoryTypeEnum.VapsAssistance : ProductCategoryTypeEnum.VapsNoneStatutory;
                }
                else if (productOption.Product.ProductClass == ProductClassEnum.Statutory && (UnderwriterEnum)productOption.Product.UnderwriterId == UnderwriterEnum.RMAMutualAssurance)
                {
                    return ProductCategoryTypeEnum.Coid;
                }
                else if (productOption.Product.ProductClass == ProductClassEnum.GroupRisk && (UnderwriterEnum)productOption.Product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
                {
                    return ProductCategoryTypeEnum.GroupRisk;
                }
                else
                {
                    return ProductCategoryTypeEnum.None;
                }
            }
        }

        public async Task<List<Benefit>> GetBenefitsByProductOptionId(int productOptionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    // Use a stored procedure, because the code to add premiums, cover amounts and
                    // age range takes too long to load. This procedure includes everything.
                    var benefits = await _benefitRepository
                        .SqlQueryAsync<Benefit>(DatabaseConstants.GetGroupRiskBenefitsByProductOption,
                            new SqlParameter("@productOptionId", productOptionId)
                        );
                    return benefits;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                    throw;
                }
            }
        }

        public async Task<List<ProductOption>> GetProductOptionsThatAllowTermArrangements()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _productOptionBillingIntegrationRepository
                    .Where(o => o.AllowTermsArrangement != null && (bool)o.AllowTermsArrangement)
                    .Select(c => c.ProductOption).ToListAsync();
                return Mapper.Map<List<ProductOption>>(data.Where(p => p != null));
            }
        }
    }
}