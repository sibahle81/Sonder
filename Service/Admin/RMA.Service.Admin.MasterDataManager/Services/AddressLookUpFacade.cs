using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class AddressLookUpFacade : RemotingStatelessService, IAddressLookUpService
    {
        public AddressLookUpFacade(StatelessServiceContext context) : base(context)
        {
        }

        public Task<List<Lookup>> GetCities()
        {
            throw new NotImplementedException();
        }
    }
}
