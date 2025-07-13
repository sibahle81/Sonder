using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IAuthorityLimitService : IService
    {
        Task<AuthorityLimitResponse> CheckUserHasAuthorityLimit(AuthorityLimitRequest request);
        Task<bool> CreateUserAuthorityLimitConfigurationAudit(AuthorityLimitRequest request);
        Task<PagedRequestResult<AuthorityLimitConfiguration>> GetPagedAuthorityLimits(AuthorityLimitSearchRequest authorityLimitSearchRequest);
        Task<List<AuthorityLimitItemTypePermissions>> GetAuthorityLimitItemTypesPermissions();
        Task<bool> UpdateAuthorityLimits(List<AuthorityLimitConfiguration> authorityLimitConfigurations);
        Task<AuthorityLimitItemTypeEnum?> GetMappedAuthorityLimitItemType(object obj);
    }
}