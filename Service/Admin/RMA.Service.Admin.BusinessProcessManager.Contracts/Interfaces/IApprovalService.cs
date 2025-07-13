using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces
{
    public interface IApprovalService : IService
    {
        Task<List<Approval>> GetApprovals();
        Task<Approval> GetApprovalById(int id);
        Task<int> AddApproval(Approval approvalViewModel);
        Task EditApproval(Approval approvalViewModel);
        Task AddApprovals(List<Approval> approvalViewModels);
        Task<List<Approval>> GetApprovalsByTypeAndId(string itemType, int itemId);
    }
}