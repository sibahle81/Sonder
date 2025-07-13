using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Broker;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Client
{
    public interface ILastViewedService : IService
    {
        Task<List<Brokerage>> GetLastViewedBrokerages(bool isBinderPartner);
        Task<List<Representative>> GetLastViewedRepresentatives();

        Task<List<Contracts.Entities.RolePlayer.RolePlayer>> GetLastViewedClients();
    }
}