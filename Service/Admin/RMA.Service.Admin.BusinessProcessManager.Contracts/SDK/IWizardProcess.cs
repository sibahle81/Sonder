using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.SDK
{
    public interface IWizardProcess
    {
        Task<int> StartWizard(IWizardContext context);
        Task SubmitWizard(IWizardContext context);
        Task OverrideWizard(IWizardContext context);
        Task CancelWizard(IWizardContext context);
        Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context);
        Task<int?> GetCustomApproverRole(IWizardContext context);
        Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName);
        Task UpdateStatus(IWizardContext context);
        Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context);
        Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context);
        Task OnApprove(IWizardContext context);
        Task OnRequestForApproval(IWizardContext context);
        Task OnSaveStep(IWizardContext context);
        Task OnSetApprovalStages(IWizardContext context);
    }
}