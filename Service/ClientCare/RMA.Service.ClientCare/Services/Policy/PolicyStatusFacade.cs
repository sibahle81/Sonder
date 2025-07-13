using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyStatusFacade : RemotingStatelessService, IPolicyStatusService
    {
        public PolicyStatusFacade(StatelessServiceContext serviceContext) : base(serviceContext)
        {
        }

        public async Task<List<Lookup>> GetPolicyStatuses()
        {
            return await Task.Run(() => typeof(PolicyStatusEnum).ToLookupList());
        }
    }
}