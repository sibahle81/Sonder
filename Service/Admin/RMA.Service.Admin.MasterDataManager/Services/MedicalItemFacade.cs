using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class MedicalItemFacade : RemotingStatelessService, IMedicalItemFacadeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_LookupValue> _LookupValueRepository;

        public MedicalItemFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<common_LookupValue> lookupValueRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _LookupValueRepository = lookupValueRepository;
        }

        public async Task<decimal> GetMedicalItemToleranceAsync()
        {
            var todaysDate = DateTimeHelper.SaNow;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _LookupValueRepository.FirstOrDefaultAsync(i => i.LookupType == LookupTypeEnum.MedicalTariffTolerance
                                                                    && (todaysDate >= i.StartDate && i.EndDate >= todaysDate));
                if (entity != null)
                    if (entity.Value != null)
                        return (decimal)entity.Value;
                return 0;
            }
        }

    }
}
