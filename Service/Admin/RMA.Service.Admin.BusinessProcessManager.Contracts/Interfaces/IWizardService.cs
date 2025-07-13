using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces
{
    public interface IWizardService : IService
    {
        Task<Wizard> GetWizard(int id);
        Task<bool> IsWizardCompleted(int? id);
        Task<List<Wizard>> GetWizardsByType(string type);
        Task<List<Wizard>> GetUserWizards();
        Task<List<Wizard>> GetUserWizardsByWizardConfigs(List<int> wizardConfigIds, bool canReassign);
        Task<PagedRequestResult<Wizard>> GetUserWizardsByWizardConfigsPaged(PagedRequest request, List<int> wizardConfigationIds, string wizardStatus, string lockStatus, string orderOverride);
        Task<PagedRequestResult<Wizard>> SearchWizards(PagedRequest request);
        Task<PagedRequestResult<Wizard>> SearchUserNewWizardsByWizardType(PagedRequest request);
        Task<PagedRequestResult<Wizard>> SearchUserNewWizardsByWizardCapturedData(PagedRequest request);
        Task<Wizard> StartWizard(StartWizardRequest wizardRequest);
        Task SaveWizard(SaveWizardRequest saveWizardRequest);
        Task SubmitWizard(int id);
        Task OverrideWizard(int id);
        Task CancelWizard(int id);
        Task CompletePrintWizard(int id);
        Task RequestApproval(int id);
        Task ApproveWizard(int id);
        Task DisputeWizard(RejectWizardRequest rejectWizardRequest);
        Task RejectWizard(RejectWizardRequest rejectWizardRequest);
        Task<RuleRequestResult> ExecuteWizardRules(int id);
        Task EditWizardName(int wizardId, string wizardName);
        Task<int> AddWizard(Wizard wizard);
        Task<List<Wizard>> LastViewed();
        Task<Wizard> GetWizardLastWizardByType(string type);
        Task<Wizard> GetWizardByLinkedItemId(int linkedItemId);
        Task<Wizard> GetWizardOnly(int wizardId);
        Task<Wizard> GetWizardNameOnly(int id);
        Task RejectOnCondition(RejectWizardRequest rejectWizardRequest);
        Task<int> GetLastWizard();
        Task UpdateWizard(Wizard wizard);
        Task<List<Wizard>> GetWizardsByConfigurationAndItemId(List<int> linkedItemIds, string configName);
        Task SendWizardNotification(string wizardConfigurationName, string notificationTitle, string notificationMessage, string notificationActionLink, int linkedItemId, string lockedToUser);
        Task<Wizard> GetWizardByLinkedItemAndConfigId(int linkedItemId, int wizardConfigId);
        Task BackgroundProcessApproveWizard(int id, bool submitWizard);
        Task<Wizard> GetWizardsByTypeAndLinkedItemId(string type, int linkedItemId);
        Task<Wizard> GetWizardsByTypeAndId(string type, int id);
        Task<List<Wizard>> GetWizardsByConfigIdsAndCreatedBy(List<int> configIds, string createdBy, int claimId);
        Task<List<Wizard>> GetWizardsInProgressByTypeAndLinkedItemId(string type, int linkedItemId);
        Task<List<Wizard>> GetWizardsInProgressByTypesAndLinkedItemId(int linkedItemId, List<string> types);
        Task<bool> CheckIfWizardHasBeenCreated(string type, string data);
        Task<List<Wizard>> GetUserWizardsByWizardConfigsAndEmail(List<int> wizardConfigIds, string email, int userRoleId);
        Task<List<Wizard>> GetPortalUserWizards(string email, int userRoleId);
        Task<List<Wizard>> GetPortalWizardsByConfigIdsAndCreatedBy(List<int> configIds, string createdBy);
        Task<List<Wizard>> GetActiveWizardsByConfigurationAndLinkedItemId(int linkedItemId, string configName);
        Task UpdateWizardLockedToUser(int wizardId, int lockedToUserId);
        Task<Wizard> GetWizardByName(string name);
        Task EditWizardStatus(int wizardId, WizardStatusEnum wizardStatus, int customApproverRoleId);
        Task SaveWizardApprovalStages(List<WizardApprovalStage> wizardApprovalStages);
        Task<List<WizardApprovalStage>> GetWizardApprovalStages(int wizardId);
        Task<List<Wizard>> GetWizardByWizardConfigurationIdAndWizardStatus(int WizardConfigurationId, DateTime startDate);
        Task<PagedRequestResult<Wizard>> GetPagedWizardsAssignedToMe(List<int> wizardConfigurationIds, PagedRequest pagedRequest);
        Task<WizardPermission> GetWizardPermissionByWizardConfig(int wizardConfigId, WizardPermissionTypeEnum wizardPermission);
        Task<List<Wizard>> GetWizardsByConfigurationAndStatus(int WizardConfigurationId, WizardStatusEnum wizardStatus);
        Task<List<Wizard>> GetWizardsByConfigurationAndStatusAndFromToDate(int WizardConfigurationId, List<WizardStatusEnum> wizardStatuses, DateTime fromDate, DateTime toDate);
        Task<bool> UpdateWizards(List<Wizard> wizard);
    }
}