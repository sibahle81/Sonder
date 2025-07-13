using Microsoft.ServiceFabric.Services.Remoting;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface ILastViewedService : IService
    {
        Task<List<Entities.Policy.Policy>> GetLastViewedPolicies();
    }
}