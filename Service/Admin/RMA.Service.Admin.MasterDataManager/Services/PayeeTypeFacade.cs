using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class PayeeTypeFacade : RemotingStatelessService, IPayeeTypeService
    {
        private readonly IRepository<common_PayeeType> _payeeTypeRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public PayeeTypeFacade(IDbContextScopeFactory dbContextScopeFactory, StatelessServiceContext context,
            IRepository<common_PayeeType> payeeTypeRepository, IMapper mapper
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _payeeTypeRepository = payeeTypeRepository;
            _mapper = mapper;
        }

        public async Task<List<PayeeType>> GetPayeeTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _payeeTypeRepository
                    .Where(payeeType => payeeType.IsActive && !payeeType.IsDeleted)
                    .OrderBy(payeeType => payeeType.Name)
                    .ProjectTo<PayeeType>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
        }

        public async Task<PayeeType> GetPayeeTypeById(int payeeTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var payeeTypes = await _payeeTypeRepository
                    .Where(p => p.IsActive && !p.IsDeleted && p.PayeeTypeId == payeeTypeId)
                    .SingleAsync();

                return _mapper.Map<PayeeType>(payeeTypes);
            }
        }
    }
}