using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class TariffBaseUnitCostTypeFacade : RemotingStatelessService, ITariffBaseUnitCostTypeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_TariffBaseUnitCostType> _tariffBaseUnitCostTypeRepository;

        public TariffBaseUnitCostTypeFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_TariffBaseUnitCostType> tariffBaseUnitCostTypeRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _tariffBaseUnitCostTypeRepository = tariffBaseUnitCostTypeRepository;
        }

        public async Task<List<TariffBaseUnitCostType>> GetTariffBaseUnitCostTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _tariffBaseUnitCostTypeRepository
                    .ProjectTo<TariffBaseUnitCostType>()
                    .ToListAsync();
            }
        }
    }
}
