using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IMyValuePlusService : IService
    {
        Task<List<string>> ImportMyValuePlus(
            PolicyOnboardOptionEnum policyOnboardOption,
            string policyNumber,
            string fileName,
            FileContentImport content);

        Task<ImportInsuredLivesSummary> ImportMyValuePlusPolicies(
            int wizardId,
            string wizardName,
            Guid fileIdentifier,
            PolicyOnboardOptionEnum policyOnboardOption,
            bool runValidations,
            bool runImport);

        Task<RuleRequestResult> GetMyValuePlusImportErrors(Guid fileIdentifier);
        Task<int> StageImportedMyValuePlus(Entities.Policy.MVP.PolicyRequest policyRequest);
        Task<List<MemberVopdStatus>> GetMemberVopdStatus(Guid fileIdentifier);
        Task<int> SendPolicyCreationNotification(Guid fileIdentifier);
        Task<int> SendLeadReceivedNotification(Guid fileIdentifier);
        Task<bool> OverrideMvpMemberVopd(VopdUpdateResponseModel vopdUpdateResponse);
        Task<bool> ProcessPolicyRequestReferenceMessageAsync(PolicyRequestReferenceMessage policyRequestReferenceMessage);
        Task<string> GetPolicyNumber(Guid fileIdentifier);
        Task<Dictionary<int, string>> GetPoliciesForRoleplayer(Guid fileIdentifier);

    }
}
