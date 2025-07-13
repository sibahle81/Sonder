using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Client;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IConsolidatedFuneralService : IService
    {
        Task<List<string>> ImportConsolidatedFuneral(
            PolicyOnboardOptionEnum policyOnboardOption,
            string policyNumber,
            string fileName,
            FileContentImport content);
        Task<ImportInsuredLivesSummary> ImportConsolidatedFuneralPolicies(
            int wizardId,
            string wizardName,
            Guid fileIdentifier,
            PolicyOnboardOptionEnum policyOnboardOption,
            bool runValidations,
            bool runImport);
        Task<RuleRequestResult> GetConsolidatedFuneralImportErrors(Guid fileIdentifier);
        Task<int> StageImportedConsolidatedFuneral(Entities.Policy.CFP.PolicyRequest policyRequest);
        Task<List<MemberVopdStatus>> GetMemberVopdStatus(Guid fileIdentifier);
        Task<int> SendPolicyCreationNotification(Guid fileIdentifier);
        Task<int> SendLeadReceivedNotification(Guid fileIdentifier);
        Task<bool> OverrideCfpMemberVopd(VopdUpdateResponseModel vopdUpdateResponse);
        Task<bool> ProcessPolicyRequestReferenceMessageAsync(PolicyRequestReferenceMessage policyRequestReferenceMessage);
        Task<string> GetPolicyNumber(Guid fileIdentifier);
        Task<List<ConsolidatedFuneralMember>> GetFuneralMembers(Guid fileIdentifier);
    }
}
