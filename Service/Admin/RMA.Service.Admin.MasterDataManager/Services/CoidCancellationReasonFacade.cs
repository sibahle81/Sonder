using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class CoidCancellationReasonFacade : RemotingStatelessService, ICoidCancellationReasonService
    {
        public CoidCancellationReasonFacade(StatelessServiceContext context) : base(context)
        {
        }

        public async Task<List<Lookup>> GetCoidCancellationReasons()
        {
            return await Task.Run(() => typeof(CoidCancellationReasonEnum).ToLookupList());
        }
    }
}
