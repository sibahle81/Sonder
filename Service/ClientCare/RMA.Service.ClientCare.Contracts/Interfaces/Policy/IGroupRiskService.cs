using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IGroupRiskService : IService
    {
        Task<List<string>> ImportGroupRisk(string fileName, int schemeRolePlayerPayeeId, string productOptionCode, FileContentImport content);
        Task<bool> ImportGroupRiskPolicies(Guid fileIdentifier);
        Task<ImportInsuredLivesSummary> VerifyGroupRiskImport(Guid fileIdentifier);
        Task<RuleRequestResult> GetGroupRiskImportErrors(Guid fileIdentifier);
        Task<List<StageGroupRiskMember>> GetStagedGroupRiskMembers(Guid fileIdentifier);
        Task<bool> OverrideGroupRiskMemberVopd(VopdUpdateResponseModel vopdUpdateResponse);
        Task<List<MemberVopdStatus>> GetMemberVopdStatus(Guid fileIdentifier);

    }
}
