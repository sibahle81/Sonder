using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class ApprovalTypeFacade : RemotingStatelessService, IApprovalTypeService
    {

        public ApprovalTypeFacade(StatelessServiceContext context) : base(context)
        {
        }

        public async Task<List<Lookup>> GetApprovalTypes()
        {
            return await Task.Run(() => typeof(ApprovalTypeEnum).ToLookupList());
        }

    }
}