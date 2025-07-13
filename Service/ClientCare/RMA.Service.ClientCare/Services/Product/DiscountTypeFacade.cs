using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using RmaIdentity = RMA.Common.Security.RmaIdentity;

namespace RMA.Service.ClientCare.Services.Product
{
    public class DiscountTypeFacade : RemotingStatelessService, IDiscountTypeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<product_DiscountType> _discountTypeRepository;
        private readonly IAuditWriter _productAuditWriter;

        public DiscountTypeFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<product_DiscountType> discountTypeRepository,
            IAuditWriter productAuditWriter) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _discountTypeRepository = discountTypeRepository;
            _productAuditWriter = productAuditWriter;
        }

        public async Task<List<DiscountType>> GetDiscountTypes()
        {
            RmaIdentity.DemandPermission(Permissions.ViewDiscountType);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var discountTypes = await _discountTypeRepository
                    .Where(discountType => !discountType.IsDeleted)
                    .ProjectTo<DiscountType>()
                    .ToListAsync();

                return discountTypes.ToList();
            }
        }

        public async Task<DiscountType> GetDiscountType(int id)
        {
            RmaIdentity.DemandPermission(Permissions.ViewDiscountType);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var discountType = await _discountTypeRepository
                    .ProjectTo<DiscountType>()
                    .SingleAsync(s => s.Id == id, $"Could not find a discount type with id {id}");

                await _productAuditWriter.AddLastViewed<product_DiscountType>(id);
                return discountType;
            }
        }

        public async Task<int> AddDiscountType(DiscountType discountType)
        {
            RmaIdentity.DemandPermission(Permissions.AddDiscountType);
            Contract.Requires(discountType != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<product_DiscountType>(discountType);
                _discountTypeRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _productAuditWriter.AddLastViewed<product_DiscountType>(discountType.Id);
                return entity.Id;
            }
        }

        public async Task EditDiscountType(DiscountType discountType)
        {
            RmaIdentity.DemandPermission(Permissions.EditDiscountType);
            Contract.Requires(discountType != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dbType = await _discountTypeRepository
                     .SingleAsync(s => s.Id == discountType.Id,
                         $"Could not find a discount type with id {discountType.Id}");

                var entity = Mapper.Map(discountType, dbType);
                _discountTypeRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _productAuditWriter.AddLastViewed<product_DiscountType>(discountType.Id);
            }
        }

        public async Task<List<DiscountType>> SearchDiscountTypes(string query)
        {
            RmaIdentity.DemandPermission(Permissions.ViewDiscountType);
            Contract.Requires(query != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var discountTypes = await _discountTypeRepository
                    .Where(discountType => !discountType.IsDeleted
                                           && (discountType.Name.Contains(query)
                                            || discountType.Code.Contains(query)
                                            || discountType.Description.Contains(query)))
                    .ProjectTo<DiscountType>()
                    .ToListAsync();

                return discountTypes;
            }
        }
    }
}