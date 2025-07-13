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
    public class ProductStatusFacade : RemotingStatelessService, IProductStatusService
    {
        public ProductStatusFacade(StatelessServiceContext context) : base(context)
        {
        }

        public async Task<List<Lookup>> GetProductStatuses()
        {
            return await Task.Run(() => typeof(ProductStatusEnum).ToLookupList());
        }
    }
}
