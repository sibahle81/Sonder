using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class VatFacade : RemotingStatelessService, IVatService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Vat> _vatRepository;

        public VatFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<common_Vat> vatRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _vatRepository = vatRepository;
        }

        public async Task<decimal> GetVatAmount(int vatCodeId, DateTime serviceDate)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _vatRepository.FirstOrDefaultAsync(a => (int)a.VatCode == vatCodeId && a.StartDate <= serviceDate && a.EndDate >= serviceDate);
                if (entity != null)
                    return entity.VatAmount;
                else
                    return 0;
            }
        }

    }
}
