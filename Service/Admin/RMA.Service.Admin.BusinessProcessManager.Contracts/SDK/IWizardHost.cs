using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.SDK
{
    public interface IWizardHost
    {
        Task<int> StartWizard(StartWizardRequest wizardRequest);
        Task SubmitWizard(Wizard wizard);
        Task CancelWizard(Wizard wizard);
        Task<RuleRequestResult> ExecuteWizardRules(Wizard wizard);
        Task<int?> GetCustomApproverRole(Wizard wizard);
        Task UpdateStatus(Wizard wizard);
        Task OnRejected(RejectWizardRequest rejectWizardRequest, Wizard wizard);
        Task OnDispute(RejectWizardRequest rejectWizardRequest, Wizard wizard);
        Task OnApprove(Wizard wizard);
        Task OnRequestForApproval(Wizard wizard);
        Task OnSaveStep(Wizard wizard);
        Task OverrideWizard(Wizard wizard);
        Task OnSetApprovalStages(Wizard wizard);
    }
}