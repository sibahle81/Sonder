using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class EventTypeFacade : RemotingStatelessService, IEventTypeService
    {

        public EventTypeFacade(StatelessServiceContext context) : base(context)
        {
        }

        public async Task<List<Lookup>> GetEventTypes()
        {
            throw new NotImplementedException("Get From Enum Lookup list");
        }
    }
}