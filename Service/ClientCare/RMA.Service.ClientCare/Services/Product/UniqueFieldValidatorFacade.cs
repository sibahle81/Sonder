using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Data.Entity;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class UniqueFieldValidatorFacade : RemotingStatelessService, IUniqueFieldValidatorService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<product_DiscountType> _discountTypeRepository
            ;

        public UniqueFieldValidatorFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_DiscountType> discountTypeRepository,
            IRepository<product_Benefit> benefitRepository,
            IRepository<product_ProductOption> productOptionRepository,
            IRepository<product_Product> productRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _discountTypeRepository = discountTypeRepository;
            _benefitRepository = benefitRepository;
            _productOptionRepository = productOptionRepository;
            _productRepository = productRepository;
        }


        public async Task<bool> Exists(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                switch (request?.Table.ToLower())
                {
                    case "benefit":
                        return await CheckBenefit(request);
                    case "product":
                        return await CheckProduct(request);
                    case "productoption":
                        return await CheckProductOption(request);
                    case "discounttype":
                        return await CheckDiscountType(request);
                    default:
                        throw new ArgumentOutOfRangeException(nameof(request));
                }
            }
        }

        private async Task<bool> CheckDiscountType(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var value = request.Value.ToLower();
                switch (request.Field.ToLower())
                {
                    case "code":
                        return await _discountTypeRepository.AnyAsync(discountType =>
                            discountType.Code.ToLower() == value && discountType.IsActive && !discountType.IsDeleted);
                    case "name":
                        return await _discountTypeRepository.AnyAsync(discountType =>
                            discountType.Name.ToLower() == value && discountType.IsActive && !discountType.IsDeleted);
                    default:
                        throw new ArgumentOutOfRangeException(nameof(request));
                }
            }
        }

        private async Task<bool> CheckProductOption(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var value = request.Value.ToLower();
                var parsed = int.TryParse(request.MetaValue, out var id);
                if (!parsed) return false;
                switch (request.Field.ToLower())
                {
                    case "name":
                        return await _productOptionRepository.AnyAsync(productOption =>
                            productOption.Name.ToLower() == value && !productOption.IsDeleted && productOption.ProductId == id);
                    default:
                        throw new ArgumentOutOfRangeException(nameof(request));
                }
            }
        }

        private async Task<bool> CheckProduct(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var value = request.Value.ToLower();
                switch (request.Field.ToLower())
                {
                    case "name":
                        return await _productRepository
                            .AnyAsync(product =>
                            product.Name.ToLower() == value);
                    case "code":
                        return await _productRepository
                            .AnyAsync(product =>
                            product.Code.ToLower() == value);
                    default:
                        throw new ArgumentOutOfRangeException(nameof(request));
                }
            }
        }

        private async Task<bool> CheckBenefit(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var value = request.Value.ToLower();
                switch (request.Field.ToLower())
                {
                    case "code":
                        return await _benefitRepository.AnyAsync(benefit =>
                            benefit.Code.ToLower() == value && !benefit.IsDeleted);
                    case "name":
                        return await _benefitRepository.AnyAsync(benefit =>
                            benefit.Name.ToLower() == value && !benefit.IsDeleted);
                    default:
                        throw new ArgumentOutOfRangeException(nameof(request));
                }
            }
        }
    }
}