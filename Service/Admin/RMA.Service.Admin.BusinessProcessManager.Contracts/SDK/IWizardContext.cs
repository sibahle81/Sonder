using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.SDK
{
    public interface IWizardContext
    {
        void Init(StartWizardRequest startWizardRequest);
        string Type { get; }
        int LinkedItemId { get; }
        string Data { get; }
        Task<int> CreateWizard(string name, ArrayList stepData, WizardStatusEnum wizardStatus = WizardStatusEnum.New);
        int CreateWizard(string name, ArrayList stepData, string lockedToUser, string customStatus, int customRoutingRoleId);
        Task<int> CreateWizardAsync(string name, ArrayList stepData, WizardStatusEnum wizardStatus = WizardStatusEnum.New);
        Task<int> CreateWizardAsync(string name, ArrayList stepData, string lockedToUser);
        Task<int> CreateWizardAsync(string name, ArrayList stepData, string lockedToUser, string customStatus, int customRoutingRoleId, WizardStatusEnum wizardStatus = WizardStatusEnum.InProgress);
        Task<RuleRequestResult> ExecuteRules(RuleRequest ruleRequest);
        T Deserialize<T>(string json);
        string Serialize<T>(T obj);
        void LogError(Exception ex);
        bool RequestInitiatedByBackgroundProcess { get; set; }
        Task UpdateWizard(Wizard wizard);
    }
}