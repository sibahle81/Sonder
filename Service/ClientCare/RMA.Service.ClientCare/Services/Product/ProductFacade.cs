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

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class ProductFacade : RemotingStatelessService, IProductService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditWriter _productAuditWriter;
        private readonly IUnderwriterService _underwriterService;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<broker_BrokerageProductOption> _brokeragProductOptions;
        private readonly IRepository<broker_RepresentativeFscaLicenseCategory> _representativeFscaLicenseCategories;
        private readonly IRepository<product_ProductBankAccount> _productBankAccountRepository;
        private readonly IRepository<product_ProductOptionDependency> _productDependecyRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<product_BenefitOptionItemValue> _productBenefitOptionItemValueRepository;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public ProductFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<product_Product> productRepository
            , IAuditWriter productAuditWriter
            , IRepository<broker_RepresentativeFscaLicenseCategory> representativeFscaLicenseCategories
            , IUnderwriterService underwriterService
            , IRepository<broker_BrokerageProductOption> brokeragProductOptions
            , IRepository<product_ProductBankAccount> productBankAccountRepository
            , IConfigurationService configurationService
            , IRepository<product_BenefitOptionItemValue> productBenefitOptionItemValueRepository
            , IRepository<product_ProductOptionDependency> productDependecy
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _productRepository = productRepository;
            _productDependecyRepository = productDependecy;
            _productAuditWriter = productAuditWriter;
            _underwriterService = underwriterService;
            _brokeragProductOptions = brokeragProductOptions;
            _representativeFscaLicenseCategories = representativeFscaLicenseCategories;
            _productBankAccountRepository = productBankAccountRepository;
            _configurationService = configurationService;
            _productDependecyRepository = productDependecy;
            _productBenefitOptionItemValueRepository = productBenefitOptionItemValueRepository;
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetProducts()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productRepository.ToListAsync();
                var products = Mapper.Map<List<Contracts.Entities.Product.Product>>(entities);
                await SetProductCategoryTypes(products);
                return products;
            }
        }

        public async Task<Contracts.Entities.Product.Product> GetProduct(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _productRepository.SingleAsync(s => s.Id == id, $"Could not find a product with the id {id}");
                await _productRepository.LoadAsync(entity, t => t.ProductRules);
                await _productRepository.LoadAsync(entity, t => t.ProductNotes);
                await _productRepository.LoadAsync(entity, t => t.ProductOptions);

                var productResult = Mapper.Map<Contracts.Entities.Product.Product>(entity);

                productResult.RuleItems = entity.ProductRules.Select(productRule => new RuleItem()
                {
                    RuleConfiguration = productRule.RuleConfiguration?.Replace("\"", "\'"),
                    RuleId = productRule.RuleId,
                    Id = productRule.Id
                }).ToList();

                await _productAuditWriter.AddLastViewed<product_Product>(id);
                await SetProductCategoryType(productResult);
                return productResult;
            }
        }

        public async Task<int> AddProduct(Contracts.Entities.Product.Product product, int? wizardId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddProduct);
            Contract.Requires(product != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_Product>(product);

                entity.ProductRules = product.RuleItems.Select(pr => new product_ProductRule
                {
                    RuleId = pr.RuleId,
                    RuleConfiguration = pr.RuleConfiguration,
                }).ToList();

                _productRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _productAuditWriter.AddLastViewed<product_Product>(entity.Id);
                return entity.Id;
            }
        }

        public async Task EditProduct(Contracts.Entities.Product.Product product, int? wizardId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditProduct);
            Contract.Requires(product != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_Product>(product);
                await _productRepository.LoadAsync(entity, r => r.ProductRules);

                //1. add new rules
                var toAdd = product.RuleItems.Where(r => r.Id == 0);
                foreach (var ruleItem in toAdd)
                {
                    entity.ProductRules.Add(new product_ProductRule
                    {
                        ProductId = entity.Id,
                        RuleId = ruleItem.RuleId,
                        RuleConfiguration = ruleItem.RuleConfiguration,
                    });
                }

                //2. remove missing rules
                var toRemove = entity.ProductRules.Where(e => e.Id > 0 && !product.RuleItems.Where(r => r.Id > 0).Select(r => r.Id).Contains(e.Id));
                foreach (var i in toRemove)
                {
                    i.IsDeleted = true;
                }

                //3. update others
                var toUpdate = product.RuleItems.Where(r => r.Id != 0 && entity.ProductRules.Select(a => a.Id).Contains(r.Id));
                foreach (var entry in toUpdate)
                {
                    entity.ProductRules.Single(i => i.Id == entry.Id).RuleConfiguration = entry.RuleConfiguration;
                }

                _productRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _productAuditWriter.AddLastViewed<product_Product>(product.Id);
            }
        }

        public async Task<PagedRequestResult<Contracts.Entities.Product.Product>> SearchProducts(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var products = await _productRepository
                    .Where(product => string.IsNullOrEmpty(request.SearchCriteria) ||
                                      product.Name.Contains(request.SearchCriteria)
                                       || product.Description.Contains(request.SearchCriteria)
                                       || product.Code.Contains(request.SearchCriteria))
                    .ToPagedResult<product_Product, Contracts.Entities.Product.Product>(request);

                return products;
            }
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetProductsByIds(List<int> productIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);
            List<Contracts.Entities.Product.Product> products = new List<Contracts.Entities.Product.Product>();
            if (productIds != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _productRepository.Where(product => productIds.Contains(product.Id)).ToListAsync();
                    products = Mapper.Map<List<Contracts.Entities.Product.Product>>(entities);

                    await SetProductCategoryTypes(products);
                }
            }
            return products;
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetProductByProductClass(ProductClassEnum productClass)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productRepository.Where(product => product.ProductClass == productClass).ToListAsync();
                var products = Mapper.Map<List<Contracts.Entities.Product.Product>>(entities);

                await SetProductCategoryTypes(products);

                return products;
            }
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetProductsByClientType(ClientTypeEnum clientType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productRepository.ToListAsync();
                var products = Mapper.Map<List<Contracts.Entities.Product.Product>>(entities);

                await SetProductCategoryTypes(products);

                return products;
            }
        }

        public async Task<List<Admin.MasterDataManager.Contracts.Entities.Underwriter>> GetUnderwriters()
        {
            var data = await _underwriterService.GetUnderwriters();
            return data;
        }

        public async Task<List<Lookup>> GetProductClassTypes()
        {
            return await Task.Run(() => typeof(ProductClassEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetProductStatusTypes()
        {
            return await Task.Run(() => typeof(ProductStatusEnum).ToLookupList());
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetActiveProductsForRepresentative(int representativeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerageIds = (await _representativeFscaLicenseCategories.Where(s => s.RepresentativeId == representativeId && !s.IsDeleted).ToListAsync()).Select(t => t.BrokerageId).Distinct().ToList();

                var productOptions = await _brokeragProductOptions.Where(bpo => brokerageIds.Contains(bpo.BrokerageId)).ToListAsync();
                await _brokeragProductOptions.LoadAsync(productOptions, po => po.ProductOption);

                var productIds = productOptions.Where(po => po.ProductOption != null).Select(po => po.ProductOption.ProductId).Distinct().ToList();
                var products = Mapper.Map<List<Contracts.Entities.Product.Product>>(await _productRepository.Where(p => productIds.Contains(p.Id)).ToListAsync());

                await SetProductCategoryTypes(products);

                return products.Where(p => p.ProductStatus == ProductStatusEnum.OpenForBusiness).ToList();
            }
        }

        public async Task<List<ProductBankAccount>> GetProductBankAccounts(IndustryClassEnum industryClass)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productBankAccountRepository
                    .Where(p => p.IndustryClass == industryClass).ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Product.ProductBankAccount>>(entities);
            }
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetActiveProductsForBroker(int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var productOptions = await _brokeragProductOptions.Where(bpo => bpo.BrokerageId == brokerageId).ToListAsync();
                await _brokeragProductOptions.LoadAsync(productOptions, po => po.ProductOption);

                var productIds = productOptions
                    .Where(po => po.ProductOption?.IsDeleted == false)
                    .Select(po => po.ProductOption.ProductId)
                    .Distinct().ToList();

                var products = Mapper.Map<List<Contracts.Entities.Product.Product>>(await _productRepository
                    .Where(p => productIds.Contains(p.Id))
                    .ToListAsync());

                await SetProductCategoryTypes(products);

                return products.Where(p => p.ProductStatus == ProductStatusEnum.OpenForBusiness).ToList();
            }
        }

        public async Task<List<string>> GetProductsWithAllOption()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _productRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetProductsWithAllOption);
            }
        }

        public async Task<List<ProductOptionDependency>> GetProductOptionDependecies()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var products = await _productDependecyRepository.ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Product.ProductOptionDependency>>(products);
            }
        }

        public async Task<List<Contracts.Entities.Product.Product>> GetProductsExcludingCertainClasses(List<int> classesToExclude)
        {
            Contract.Requires(classesToExclude != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            var excludedClasses = new List<ProductClassEnum>();
            if (classesToExclude.Count > 0)
            {
                foreach (var classToExclude in classesToExclude)
                {
                    excludedClasses.Add((ProductClassEnum)Enum.ToObject(typeof(ProductClassEnum), classToExclude));
                }
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productRepository.Where(p => !excludedClasses.Contains(p.ProductClass)).ToListAsync();
                var products = Mapper.Map<List<Contracts.Entities.Product.Product>>(entities);
                await SetProductCategoryTypes(products);
                return products;
            }
        }

        public async Task<List<ProductBankAccount>> GetProductBankAccountsByProductId(int productId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productBankAccountRepository
                    .Where(p => p.ProductId == productId).ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Product.ProductBankAccount>>(entities);
            }
        }

        public async Task<List<BenefitOptionItemValue>> GetBenefitOptionItemValueByBenefitId(int benefitId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productBenefitOptionItemValueRepository
                    .Where(p => p.BenefitId == benefitId).ToListAsync();
                return Mapper.Map<List<BenefitOptionItemValue>>(entities);
            }
        }

        private Task SetProductCategoryType(Contracts.Entities.Product.Product product)
        {
            Contract.Requires(product != null);
            if ((product.ProductClass == ProductClassEnum.Life || product.ProductClass == ProductClassEnum.ValuePlus) && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                product.ProductCategoryType = ProductCategoryTypeEnum.Funeral;
            }
            else if (product.ProductClass == ProductClassEnum.Assistance || product.ProductClass == ProductClassEnum.NonStatutory && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                product.ProductCategoryType = product.ProductClass == ProductClassEnum.Assistance ? ProductCategoryTypeEnum.VapsAssistance : ProductCategoryTypeEnum.VapsNoneStatutory;
            }
            else if (product.ProductClass == ProductClassEnum.Statutory && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMAMutualAssurance)
            {
                product.ProductCategoryType = ProductCategoryTypeEnum.Coid;
            }
            else if (product.ProductClass == ProductClassEnum.GroupRisk && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                product.ProductCategoryType = ProductCategoryTypeEnum.GroupRisk;
            }
            else
            {
                product.ProductCategoryType = null;
            }

            return Task.CompletedTask;
        }

        private Task SetProductCategoryTypes(List<Contracts.Entities.Product.Product> products)
        {
            foreach (var product in products)
            {
                if ((product.ProductClass == ProductClassEnum.Life || product.ProductClass == ProductClassEnum.ValuePlus) && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
                {
                    product.ProductCategoryType = ProductCategoryTypeEnum.Funeral;
                }
                else if (product.ProductClass == ProductClassEnum.Assistance || product.ProductClass == ProductClassEnum.NonStatutory && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
                {
                    product.ProductCategoryType = product.ProductClass == ProductClassEnum.Assistance ? ProductCategoryTypeEnum.VapsAssistance : ProductCategoryTypeEnum.VapsNoneStatutory;
                }
                else if (product.ProductClass == ProductClassEnum.Statutory && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMAMutualAssurance)
                {
                    product.ProductCategoryType = ProductCategoryTypeEnum.Coid;
                }
                else
                {
                    product.ProductCategoryType = null;
                }
            }

            return Task.CompletedTask;
        }

        public async Task<List<Contracts.Entities.Product.ProductBankAccount>> GetProductBankAccountsByClassAndBankAccountId(IndustryClassEnum industryClass, int bankAccountId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewProduct);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _productBankAccountRepository
                    .Where(p => p.IndustryClass == industryClass && p.BankAccountId == bankAccountId).ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Product.ProductBankAccount>>(entities);
            }
        }    
    }
}