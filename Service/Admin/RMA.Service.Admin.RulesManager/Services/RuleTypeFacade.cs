using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.RulesManager.Services
{
    public class RuleTypeFacade : RemotingStatelessService, IRuleTypeService
    {

        public RuleTypeFacade(StatelessServiceContext context)
            : base(context)
        {
        }

        public async Task<List<Lookup>> GetRuleTypes()
        {
            return await Task.Run(() => typeof(RuleTypeEnum).ToLookupList());
        }
    }
}