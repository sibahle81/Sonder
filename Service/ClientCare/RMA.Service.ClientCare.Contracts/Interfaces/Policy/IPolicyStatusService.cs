using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyStatusService : IService
    {
        Task<List<Lookup>> GetPolicyStatuses();
    }
}