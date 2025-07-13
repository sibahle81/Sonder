using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IRolePlayerQueryService : IService
    {
        Task<RolePlayerItemQuery> AddRolePlayerItemQuery(RolePlayerItemQuery rolePlayerItemQuery);
        Task<int> UpdateRolePlayerItemQuery(RolePlayerItemQuery rolePlayerItemQuery);
        Task<RolePlayerItemQuery> GetRolePlayerItemQueryById(int rolePlayerItemQueryId);
        Task<PagedRequestResult<RolePlayerItemQuery>> GetPagedRolePlayerItemQueries(RolePlayerQueryItemTypeEnum rolePlayerQueryItemType, PagedRequest pagedRequest);
        Task<int> AddRolePlayerItemQueryResponse(RolePlayerItemQueryResponse rolePlayerItemQueryResponse);
        Task<PagedRequestResult<RolePlayerItemQueryResponse>> GetPagedRolePlayerItemQueryResponses(PagedRequest pagedRequest);
    }
}
