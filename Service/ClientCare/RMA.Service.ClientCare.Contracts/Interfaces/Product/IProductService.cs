using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductService : IService
    {
        Task<PagedRequestResult<Entities.Product.Product>> SearchProducts(PagedRequest request);
        Task<List<Entities.Product.Product>> GetProducts();
        Task<Entities.Product.Product> GetProduct(int id);
        Task<int> AddProduct(Entities.Product.Product product, int? wizardId);
        Task EditProduct(Entities.Product.Product product, int? wizardId);
        Task<List<Entities.Product.Product>> GetProductsByIds(List<int> productIds);
        Task<List<Entities.Product.Product>> GetProductByProductClass(ProductClassEnum productClass);
        Task<List<Entities.Product.Product>> GetProductsByClientType(ClientTypeEnum clientType);
        Task<List<Lookup>> GetProductClassTypes();
        Task<List<Lookup>> GetProductStatusTypes();
        Task<List<Admin.MasterDataManager.Contracts.Entities.Underwriter>> GetUnderwriters();
        Task<List<Entities.Product.Product>> GetActiveProductsForRepresentative(int representativeId);

        Task<List<Contracts.Entities.Product.ProductBankAccount>> GetProductBankAccounts(
            IndustryClassEnum industryClass);

        Task<List<Contracts.Entities.Product.Product>> GetActiveProductsForBroker(int brokerageId);
        Task<List<string>> GetProductsWithAllOption();
        Task<List<ProductOptionDependency>> GetProductOptionDependecies();
        Task<List<Entities.Product.Product>> GetProductsExcludingCertainClasses(List<int> classesToExclude);
        Task<List<ProductBankAccount>> GetProductBankAccountsByProductId(int productId);
        Task<List<BenefitOptionItemValue>> GetBenefitOptionItemValueByBenefitId(int benefitId);

        Task<List<Contracts.Entities.Product.ProductBankAccount>> GetProductBankAccountsByClassAndBankAccountId(
    IndustryClassEnum industryClass, int bankAccountId);

    }
}