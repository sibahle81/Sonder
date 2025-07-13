using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductOptionService : IService
    {
        Task<int> AddProductOption(ProductOption productOption);
        Task EditProductOption(ProductOption productOption);
        Task<List<ProductOption>> GetProductOptionNamesByProductId(int productId);
        Task<List<ProductOption>> GetProductOptionsByProductId(int productId);
        Task<ProductOption> GetProductOption(int id);
        Task<List<ProductOption>> GetProductOptions();
        Task<CoverTypeEnum> GetCoverTypeByProductOptionId(int productOptionId);
        Task RemoveProductOption(int id);
        Task<PagedRequestResult<ProductOption>> SearchProductOptions(PagedRequest request);
        Task<List<Benefit>> GetCoverMemberTypeBenefitsForProductOption(int productOptionId, CoverMemberTypeEnum coverMemberType);
        Task<List<Benefit>> GetBenefitsForOption(int productOptionId);
        Task<List<Benefit>> GetBenefitsForOptionAndBenefits(int productOptionId, List<int> benefitIds);
        Task<List<BenefitModel>> GetBenefitsForProductOption(int productOptionId);
        Task<List<BenefitModel>> GetBenefitsForProductOptionAndCoverType(int productOptionId, int coverMemberTypeId);
        Task<List<Benefit>> GetBenefitsByBenefitIds(int productOptionId, List<int> benefitIds);
        Task<PagedRequestResult<ProductOption>> GetBrokerProductOptions(PagedRequest request);
        Task<PagedRequestResult<ProductOption>> GetBrokerProductOptionsByProductId(PagedRequest request);
        Task<List<ProductOption>> GetProductOptionsByIds(List<int> ids);
        Task<List<Benefit>> GetBenefitsForExtendedMembers(int mainMemberOptionId);
        Task<List<ProductOption>> GetProductOptionsByCoverTypeIds(List<int> coverTypes);
        Task<List<ProductOptionCoverType>> GetProductOptionCoverTypeByproductOptionId(int productOptionId);
        Task<Contracts.Entities.Product.Product> GetProductByProductOptionId(int productOptionId);
        Task<bool> CheckIfBenefitExist(int productOptionId, string benefitRule);
        Task<List<string>> GetProductOptionWithAllOption();
        Task<List<ProductOptionDependency>> GetProductOptionDependecies(int parentOptionId);
        Task<List<ProductOptionPaymentFrequency>> GetProductOptionPaymentFrequency(int productOptionId);
        Task<BenefitRate> GetBenefitRate(int benefitId);
        Task<List<Template>> GetTemplates();
        Task<Template> GetTemplate(int templateId);
        Task<int> ImportBenefits(BenefitImportRequest request);
        Task<List<ProductOption>> GetProductOptionsByProductIds(List<int> productIds);
        Task<List<ProductOption>> GetProductOptionsByIdsForDeclarations(List<int> ids);
        Task<List<ProductOption>> GetProductOptionsWithAllowanceTypes();
        Task<List<ProductOption>> GetProductOptionsWithDependencies();
        Task<List<ProductOption>> GetProductOptionsThatAccumulatesInterest();
        Task<ProductCategoryTypeEnum> GetProductCategoryType(int productOptionId);
        Task<List<Benefit>> GetBenefitsByBenefitIdsOnly(List<int> benefitIds);
        Task<List<ProductOption>> GetProductOptionsIncludeDeleted();
        Task<List<Benefit>> GetBenefitsByProductOptionId(int productOptionId);
        Task<List<ProductOption>> GetProductOptionsThatAllowTermArrangements();
    }
}