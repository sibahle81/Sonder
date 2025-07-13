using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Api.Controllers
{
    public class WizardController : RmaApiController
    {
        private readonly IWizardService _wizardService;

        public WizardController(IWizardService wizardService)
        {
            _wizardService = wizardService;
        }

        // GET bpm/api/Wizard/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Wizard>> Get(int id)
        {
            var wizard = await _wizardService.GetWizard(id);
            return Ok(wizard);
        }

        // GET bpm/api/Wizard/GetWizardsByType/{type}
        [HttpGet("GetWizardsByType/{type}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetWizardsByType(string type)
        {
            var wizards = await _wizardService.GetWizardsByType(type);
            return Ok(wizards);
        }

        [HttpGet("GetLastWizardByType/{type}")]
        public async Task<ActionResult<Wizard>> GetWizardLastWizardByType(string type)
        {
            var wizard = await _wizardService.GetWizardLastWizardByType(type);
            return Ok(wizard);
        }

        // GET bpm/api/Wizard/GetUserWizards
        [HttpGet("GetUserWizards")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetUserWizards()
        {
            var wizards = await _wizardService.GetUserWizards();
            wizards = wizards.OrderByDescending(wizard => wizard.Id).ToList();
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetUserWizardsByWizardConfigs/{wizardConfigIds/{wizardConfigIds}/{page}/{pageSize}/{orderBy}/{sortDirection}/{wizardStatus}/{lockStatus}/{query?}}
        [HttpGet("GetUserWizardsByWizardConfigsPaged/{wizardConfigIds}/{page}/{pageSize}/{orderBy}/{sortDirection}/{wizardStatus}/{lockStatus}/{orderOverride?}/{query?}")]
        public async Task<ActionResult> GetUserWizardsByWizardConfigsPaged(string wizardConfigIds, int page = 1, int pageSize = 10, string orderBy = "StartDateAndTime", string sortDirection = "asc", string wizardStatus = "", string lockStatus = "", string orderOverride = "", string query = "")
        {
            var ids = wizardConfigIds?.Split(',').Select(int.Parse).ToList();
            query = query == "null" ? "" : query;
            orderOverride = orderOverride == "null" ? "" : orderOverride;
            var wizards = await _wizardService.GetUserWizardsByWizardConfigsPaged(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), ids, wizardStatus, lockStatus, orderOverride);
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetUserWizardsByWizardConfigs/{wizardConfigIds}
        [HttpGet("GetUserWizardsByWizardConfigs/{wizardConfigIds}/{canReAssignTask}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetUserWizardsByWizardConfigs(string wizardConfigIds, bool canReassignTask)
        {
            var ids = wizardConfigIds?.Split(',').Select(int.Parse).ToList();
            var wizards = await _wizardService.GetUserWizardsByWizardConfigs(ids, canReassignTask);
            wizards = wizards.OrderByDescending(wizard => wizard.CreatedDate).ToList();
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetWizardsByConfigIdsAndCreatedBy/{configIds}/{createdBy}
        [HttpGet("GetWizardsByConfigIdsAndCreatedBy/{configIds}/{createdBy}/{claimId}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetWizardsByConfigIdsAndCreatedBy(string configIds, string createdBy, int claimId)
        {
            var ids = configIds?.Split(',').Select(int.Parse).ToList();
            var wizards = await _wizardService.GetWizardsByConfigIdsAndCreatedBy(ids, createdBy, claimId);
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/SearchWizards/{query}
        [HttpGet("SearchWizards/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Wizard>>> SearchWizards(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var wizards = await _wizardService.SearchWizards(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/SearchUserNewWizardsByWizardType/{query}
        [HttpGet("SearchUserNewWizardsByWizardType/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Wizard>>> SearchUserNewWizardsByWizardType(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var wizards = await _wizardService.SearchUserNewWizardsByWizardType(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(wizards);
        }

        [HttpGet("SearchUserNewWizardsByWizardCapturedData/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Wizard>>> SearchUserNewWizardsByWizardCapturedData(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var wizards = await _wizardService.SearchUserNewWizardsByWizardCapturedData(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(wizards);
        }

        // POST bpm/api/Wizard/StartWizard
        [HttpPost("StartWizard")]
        public async Task<ActionResult<Wizard>> StartWizard(StartWizardRequest startWizardRequest)
        {
            var wizard = await _wizardService.StartWizard(startWizardRequest);
            return Ok(wizard);
        }

        // PUT bpm/api/Wizard/SaveWizard
        [HttpPut("SaveWizard")]
        public async Task<ActionResult> SaveWizard([FromBody] SaveWizardRequest saveWizardRequest)
        {
            await _wizardService.SaveWizard(saveWizardRequest);
            return Ok();
        }

        // GET  bpm/api/Wizard/Continue/{id}
        [HttpGet("Continue/{id}")]
        public async Task<ActionResult<Wizard>> ContinueWizard(int id)
        {
           var wizard = await _wizardService.GetWizard(id);
                if (wizard.WizardStatus == WizardStatusEnum.New)
                {
                    wizard.WizardStatus = WizardStatusEnum.InProgress;
                    await _wizardService.UpdateWizard(wizard);
                }
                return Ok(wizard);
        }

        // POST bpm/api/Wizard/SubmitWizard/{id}
        [HttpPost("SubmitWizard/{id}")]
        public async Task<ActionResult<bool>> SubmitWizard(int id)
        {
            await _wizardService.SubmitWizard(id);
            return Ok(true);
        }

        // POST bpm/api/Wizard/SubmitWizard/{id}
        [HttpPost("OverrideWizard/{id}")]
        public async Task<ActionResult<bool>> OverrideWizard(int id)
        {
            await _wizardService.OverrideWizard(id);
            return Ok(true);
        }

        // POST  bpm/api/Wizard/CancelWizard/{id}
        [HttpPost("CancelWizard/{id}")]
        public async Task<ActionResult> CancelWizard(int id)
        {
            await _wizardService.CancelWizard(id);
            return Ok();
        }

        // POST  bpm/api/Wizard/RequestApproval/{id}
        [HttpPost("RequestApproval/{id}")]
        public async Task<ActionResult> RequestApproval(int id)
        {
            await _wizardService.RequestApproval(id);
            return Ok();
        }

        // POST  bpm/api/Wizard/ApproveWizard/{id}
        [HttpPost("ApproveWizard/{id}")]
        public async Task<ActionResult<bool>> ApproveWizard(int id)
        {
            await _wizardService.ApproveWizard(id);
            return Ok(true);
        }

        // POST  bpm/api/Wizard/DisputeWizard
        [HttpPost("DisputeWizard")]
        public async Task<ActionResult> DisputeWizard([FromBody] RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.DisputeWizard(rejectWizardRequest);
            return Ok();
        }

        // POST bpm/api/Wizard/FinalRejectWizard
        [HttpPost("FinalRejectWizard")]
        public async Task<ActionResult> FinalRejectWizard([FromBody] RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.RejectWizard(rejectWizardRequest);
            return Ok();
        }

        // POST bpm/api/Wizard/ExecuteWizardRules/{id}
        [HttpPost("ExecuteWizardRules/{id}")]
        public async Task<ActionResult<RuleRequestResult>> ExecuteWizardRules(int id)
        {
            var submitResult = await _wizardService.ExecuteWizardRules(id);
            return Ok(submitResult);
        }

        // GET bpm/api/Wizard/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Wizard>>> LastViewed()
        {
            var wizards = await _wizardService.LastViewed();
            return Ok(wizards);
        }

        // POST bpm/api/Wizard/RenameWizard/{id}/{name}
        [HttpPost("RenameWizard/{id}/{name}")]
        public async Task<ActionResult<bool>> RenameWizard(int id, string name)
        {
            await _wizardService.EditWizardName(id, name);
            return Ok(true);
        }

        [HttpGet("GetWizardName/{id}")]
        public async Task<ActionResult<Wizard>> GetWizardName(int id)
        {
            var wizard = await _wizardService.GetWizardNameOnly(id);
            return Ok(wizard);
        }


        [HttpGet("GetWizardByLinkedItemId/{linkedItemId}")]
        public async Task<ActionResult<Wizard>> GetWizardByLinkedItemId(int linkedItemId)
        {
            var wizard = await _wizardService.GetWizardByLinkedItemId(linkedItemId);
            return Ok(wizard);
        }

        // POST bpm/api/Wizard/RejectOnCondition
        [HttpPost("RejectOnCondition")]
        public async Task<ActionResult> RejectOnCondition([FromBody] RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.RejectOnCondition(rejectWizardRequest);
            return Ok();
        }

        [HttpGet("GetWizardsByTypeAndLinkedItemId/{linkedItemId}/{type}")]
        public async Task<ActionResult<Wizard>> GetWizardsByTypeAndLinkedItemId(int linkedItemId, string type)
        {
            var wizard = await _wizardService.GetWizardsByTypeAndLinkedItemId(type, linkedItemId);
            return Ok(wizard);
        }


        [HttpGet("GetWizardsInProgressByTypeAndLinkedItemId/{linkedItemId}/{type}")]
        public async Task<ActionResult<List<Wizard>>> GetWizardsInProgressByTypeAndLinkedItemId(int linkedItemId, string type)
        {
            var wizards = await _wizardService.GetWizardsInProgressByTypeAndLinkedItemId(type, linkedItemId);
            return Ok(wizards);
        }

        [HttpGet("GetWizardsByTypeAndId/{id}/{type}")]
        public async Task<ActionResult<Wizard>> GetWizardsByTypeAndId(int id, string type)
        {
            var wizard = await _wizardService.GetWizardsByTypeAndId(type, id);
            return Ok(wizard);
        }

        [HttpGet("GetWizardsInProgressByTypesAndLinkedItemId/{linkedItemId}/{wizardTypes}")]
        public async Task<ActionResult<List<Wizard>>> GetWizardsInProgressByTypesAndLinkedItemId(int linkedItemId, string wizardTypes)
        {
            var types = wizardTypes?.Split(',').ToList();
            var wizards = await _wizardService.GetWizardsInProgressByTypesAndLinkedItemId(linkedItemId, types);
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetPortalWizardsByConfigIdsAndCreatedBy/{configIds}/{createdBy}
        [HttpGet("GetPortalWizardsByConfigIdsAndCreatedBy/{configIds}/{createdBy}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetPortalWizardsByConfigIdsAndCreatedBy(string configIds, string createdBy)
        {
            var ids = configIds?.Split(',').Select(int.Parse).ToList();
            var wizards = await _wizardService.GetPortalWizardsByConfigIdsAndCreatedBy(ids, createdBy);
            return Ok(wizards);
        }

        // POST bpm/api/Wizard/UpdateWizardLockedToUser/{id}/{name}
        [HttpPost("UpdateWizardLockedToUser/{id}/{lockedToUserId}")]
        public async Task<ActionResult<bool>> UpdateWizardLockedToUser(int id, int lockedToUserId)
        {
            await _wizardService.UpdateWizardLockedToUser(id, lockedToUserId);
            return Ok(true);
        }

        // GET bpm/api/Wizard/getWizardByName/{name}
        [HttpGet("getWizardByName/{name}")]
        public async Task<ActionResult<Wizard>> GetWizardByName(string name)
        {
            var wizards = await _wizardService.GetWizardByName(name);
            return Ok(wizards);
        }

        [AllowAnonymous]
        [HttpPost("StartWizardAnon")]
        public async Task<ActionResult<Wizard>> StartWizardAnon(StartWizardRequest startWizardRequest)
        {
            var wizard = await _wizardService.StartWizard(startWizardRequest);
            return Ok(wizard);
        }

        [HttpGet("GetWizardApprovalStages/{id}")]
        public async Task<ActionResult<WizardApprovalStage>> GetWizardApprovalStages(int id)
        {
            var wizard = await _wizardService.GetWizardApprovalStages(id);
            return Ok(wizard);
        }

        [HttpGet("GetPagedWizardsAssignedToMe/{wizardConfigIds?}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult> GetPagedWizardsAssignedToMe(string wizardConfigIds = "", int page = 1, int pageSize = 5, string orderBy = "createdDate", string sortDirection = "asc", string query = "")
        {
            var ids = wizardConfigIds == "none" ? new List<int>() : wizardConfigIds?.Split(',').Select(int.Parse).ToList();

            var wizards = await _wizardService.GetPagedWizardsAssignedToMe(ids, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(wizards);
        }

        [HttpGet("GetWizardPermissionByWizardConfig/{wizardConfigId}/{wizardPermission}")]
        public async Task<ActionResult<WizardPermission>> GetWizardPermissionByWizardConfig(int wizardConfigId, WizardPermissionTypeEnum wizardPermission)
        {
            var result = await _wizardService.GetWizardPermissionByWizardConfig(wizardConfigId, wizardPermission);
            return Ok(result);
        }

        [HttpPost("UpdateWizards")]
        public async Task<ActionResult<bool>> UpdateWizards([FromBody] List<Wizard> wizards)
        {
            return await _wizardService.UpdateWizards(wizards);
        }
    }
}