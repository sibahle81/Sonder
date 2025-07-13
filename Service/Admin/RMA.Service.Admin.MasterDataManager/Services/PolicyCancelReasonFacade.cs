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
    public class PolicyCancelReasonFacade : RemotingStatelessService, IPolicyCancelReasonService
    {
        public PolicyCancelReasonFacade(StatelessServiceContext context) : base(context)
        {

        }
        public async Task<List<Lookup>> GetPolicyCancelReasons()
        {
            return await Task.Run(() => typeof(PolicyCancelReasonEnum).ToLookupList());
        }
    }
}