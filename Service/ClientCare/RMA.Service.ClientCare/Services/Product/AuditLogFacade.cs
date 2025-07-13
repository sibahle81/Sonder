using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using IAuditLogService = RMA.Service.ClientCare.Contracts.Interfaces.Product.IAuditLogService;

namespace RMA.Service.ClientCare.Services.Product
{
    public class AuditLogFacade : RemotingStatelessService, IAuditLogService
    {
        private readonly IAuditLogV1Service _auditLogService;
        private readonly IRepository<product_ProductRule> _productRuleRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IProductClassService _productClassService;
        private readonly ICoverTypeService _coverTypeService;
        private readonly IFrequencyTypeService _frequencyTypeService;
        private readonly IRuleService _ruleService;
        private readonly IUnderwriterService _underwriterService;
        private readonly IProductService _productService;

        public AuditLogFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IProductClassService productClassService
            , ICoverTypeService coverTypeService
            , IFrequencyTypeService frequencyTypeService
            , IRuleService ruleService
            , IRepository<product_ProductRule> productRuleRepository
            , IProductService productService
            , IUnderwriterService underwriterService, IAuditLogV1Service auditLogService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _productRuleRepository = productRuleRepository;
            _productClassService = productClassService;
            _coverTypeService = coverTypeService;
            _frequencyTypeService = frequencyTypeService;
            _ruleService = ruleService;
            _underwriterService = underwriterService;
            _auditLogService = auditLogService;
            _productService = productService;
        }

        public async Task<AuditResult> GetAuditLog(int id)
        {
            AuditResult result = null;
            if (id > 0)
            {
                result = await _auditLogService.GetAuditLog(id);
                Action<AuditResult> getLookupDetails = ProductLookup;
                result.ExtractPropertyDetails(getLookupDetails);
            }
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            List<AuditResult> result = null;
            if (!string.IsNullOrEmpty(correlationToken))
            {
                result = await _auditLogService.GetAuditLogsByToken(correlationToken);
                Action<AuditResult> getLookupDetails = ProductLookup;
                result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            }
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId)
        {
            List<AuditResult> result = null;
            if (!string.IsNullOrEmpty(itemType) && itemId>0)
            {
                result = await _auditLogService.GetAuditLogs(itemType, itemId);
                Action<AuditResult> getLookupDetails = ProductLookup;
                result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            }
            return result;
        }

        private void ProductLookup(AuditResult audit)
        {
            switch (audit.ItemType)
            {
                case "product_Product":
                    audit.OldItem = ParseProduct(audit.OldItem);
                    audit.NewItem = ParseProduct(audit.NewItem);
                    break;
                case "product_ProductOption":
                    audit.OldItem = ParseProductOption(audit.OldItem);
                    audit.NewItem = ParseProductOption(audit.NewItem);
                    break;
                case "product_Benefit":
                    audit.OldItem = ParseBenefit(audit.OldItem);
                    audit.NewItem = ParseBenefit(audit.NewItem);
                    break;
            }
        }

        private string ParseBenefit(string benefit)
        {
            if (benefit == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(benefit);

            item.Remove("BenefitBeneficiaryTypes");
            item.Remove("BenefitMedicalReportTypes");
            item.Remove("BenefitNotes");
            item.Remove("Policies");
            item.Remove("PolicyInsuredLives");
            item.Remove("ProductOptions");
            item.Remove("Rates");
            item.Remove("IsCaptureEarnings");
            item.Remove("IsAddBeneficiaries");
            item.Remove("IsMedicalReportRequired");

            item.BenefitStatus = GetProductStatus(item.EndDate as DateTime?).DisplayAttributeValue();

            if (item.BenefitType != null)
                item.BenefitType = GetBenefitTypeName(item.BenefitType);

            if (item.CoverMemberType != null)
                item.CoverMemberType = GetCoverMemberTypeName(item.CoverMemberType);

            if (item.ProductId != null)
            {
                Task<string> productName = GetProductName((int)item.ProductId);
                item.Product = productName.Result.Length == 0 ? "Not Available" : productName.Result;
            }

            return JsonConvert.SerializeObject(item);
        }

        public async Task<string> GetProductName(int id)
        {
            var productName=string.Empty;
            if (id > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    productName = (await _productService.GetProduct(id)).Name;
                }
            }
            return productName;
        }

        private string ParseProductOption(string productOption)
        {
            if (productOption == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(productOption);

            item.Remove("Product");
            item.Remove("Policies");
            item.Remove("BrokerageProductOptions");
            item.Remove("Brokerages");
            item.Remove("ProductOptionNotes");
            item.Remove("Rates");
            item.Remove("ProductType");
            item.ProductOptionStatus = GetProductStatus(item.EndDate as DateTime?).DisplayAttributeValue();

            if (item.ProductId != null)
            {
                Task<string> productName = GetProductName((int)item.ProductId);
                item.Product = productName.Result.Length == 0 ? "Not Available" : productName.Result;
            }

            return JsonConvert.SerializeObject(item);
        }

        private string ParseProduct(string product)
        {
            if (product == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(product);

            item.Remove("QuoteProducts");
            item.Remove("Premiums");
            item.Remove("ClientCovers");
            item.Remove("ProductOptions");
            item.Remove("ProductNotes");
            item.Remove("CoverType");
            item.Remove("Benefits");
            item.Remove("LeadProducts");
            item.Remove("ProductBankAccounts");

            if (item.ProductClass != null)
                item.ProductClassName = GetProductClassName(item.ProductClass);
            item.Remove("ProductClass");

            if (item.BenefitType != null)
                item.BenefitType = GetBenefitTypeName(item.BenefitType);

            if (item.CoverMemberType != null)
                item.CoverMemberType = GetCoverMemberTypeName(item.CoverMemberType);

            //if (item.Id != null)
            //item.ProductRule = GetRuleName(item.Id);

            if (item.UnderwriterId != null)
                item.Underwriter = GetUnderwriterName(Convert.ToInt32(item.UnderwriterId));

            item.ProductStatus = GetProductStatus(item.EndDate as DateTime?).DisplayAttributeValue();

            return JsonConvert.SerializeObject(item);
        }

        private static ProductStatusEnum GetProductStatus(DateTime? endDate)
        {
            return !endDate.HasValue || endDate.Value.Date >= DateTimeHelper.SaNow
                ? ProductStatusEnum.OpenForBusiness
                : ProductStatusEnum.ClosedForBusiness;
        }

        private string GetProductCoverType(dynamic coverType)
        {
            return ((CoverTypeEnum)coverType).DisplayAttributeValue();
        }

        private dynamic GetFrequencyName(dynamic frequencyType)
        {
            return ((PaymentFrequencyEnum)frequencyType).DisplayAttributeValue();
        }

        private dynamic GetProductClassName(dynamic productClass)
        {
            return ((ProductClassEnum)productClass).DisplayAttributeValue();
        }

        private dynamic GetCoverMemberTypeName(dynamic coverMemberType)
        {
            return ((CoverMemberTypeEnum)coverMemberType).DisplayAttributeValue();
        }

        private dynamic GetBenefitTypeName(dynamic benefitType)
        {
            return ((BenefitTypeEnum)benefitType).DisplayAttributeValue();
        }

        private string GetUnderwriterName(int underwriterId)
        {
            return _underwriterService.GetUnderwriterName(underwriterId).GetAwaiter().GetResult();
        }

        private dynamic GetRuleName(dynamic Id)
        {
            int ruleId = 0;
            if (int.TryParse($"{Id}", out int itemId))
                ruleId = GetProductRuleId(itemId);
            if (ruleId == 0) return "None";
            var rule = _ruleService.GetRule(ruleId).Result;
            return rule.Name;

        }

        public int GetProductRuleId(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int ruleId = _productRuleRepository
                      .Where(s => s.ProductId == id)
                      .Select(r => r.RuleId)
                      .FirstOrDefault();

                return ruleId;
            }
        }
    }
}
