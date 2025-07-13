using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces
{
    public interface IApprovalTypeService : IService
    {
        Task<List<Lookup>> GetApprovalTypes();
    }
}