using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Wizard = System.Web.UI.WebControls.Wizard;

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserWizardController : ControllerBase
    {
        private readonly IWizardService _wizardService;

        public UserWizardController(IWizardService wizardService)
        {
            _wizardService = wizardService;
        }

        // GET bpm/api/Wizard/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Wizard>> Get(int id)
        {
            var wizard = await _wizardService.GetWizard(id);
            return Ok(wizard);
        }

        // GET bpm/api/Wizard/GetWizardsByType/{type}
        [AllowAnonymous]
        [HttpGet("GetWizardsByType/{type}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetWizardsByType(string type)
        {
            var wizards = await _wizardService.GetWizardsByType(type);
            return Ok(wizards);
        }

        [HttpGet("GetLastWizardByType/{type}")]
        [AllowAnonymous]
        public async Task<ActionResult<Wizard>> GetWizardLastWizardByType(string type)
        {
            var wizard = await _wizardService.GetWizardLastWizardByType(type);
            return Ok(wizard);
        }

        // GET bpm/api/Wizard/GetUserWizards
        [AllowAnonymous]
        [HttpGet("GetUserWizards")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetUserWizards()
        {
            var wizards = await _wizardService.GetUserWizards();
            wizards = wizards.OrderByDescending(wizard => wizard.Id).ToList();
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetUserWizardsByWizardConfigs/{wizardConfigIds}
        [AllowAnonymous]
        [HttpGet("GetUserWizardsByWizardConfigs/{wizardConfigIds}/{canReAssignTask}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetUserWizardsByWizardConfigs(string wizardConfigIds, bool canReassignTask)
        {
            var ids = wizardConfigIds?.Split(',').Select(int.Parse).ToList();
            var wizards = await _wizardService.GetUserWizardsByWizardConfigs(ids, canReassignTask);
            wizards = wizards.OrderByDescending(wizard => wizard.CreatedDate).ToList();
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetWizardsByConfigIdsAndCreatedBy/{configIds}/{createdBy}
        [AllowAnonymous]
        [HttpGet("GetWizardsByConfigIdsAndCreatedBy/{configIds}/{createdBy}/{claimId}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetWizardsByConfigIdsAndCreatedBy(string configIds, string createdBy, int claimId)
        {
            var ids = configIds?.Split(',').Select(int.Parse).ToList();
            var wizards = await _wizardService.GetWizardsByConfigIdsAndCreatedBy(ids, createdBy, claimId);
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/SearchWizards/{query}
        [AllowAnonymous]
        [HttpGet("SearchWizards/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Wizard>>> SearchWizards(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var wizards = await _wizardService.SearchWizards(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(wizards);
        }

        // POST bpm/api/Wizard/StartWizard
        [AllowAnonymous]
        [HttpPost("StartWizard")]
        public async Task<ActionResult<Wizard>> StartWizard(StartWizardRequest startWizardRequest)
        {
            var wizard = await _wizardService.StartWizard(startWizardRequest);
            return Ok(wizard);
        }

        // PUT bpm/api/Wizard/SaveWizard
        [AllowAnonymous]
        [HttpPut("SaveWizard")]
        public async Task<ActionResult> SaveWizard([FromBody] SaveWizardRequest saveWizardRequest)
        {
            await _wizardService.SaveWizard(saveWizardRequest);
            return Ok();
        }

        // GET  bpm/api/Wizard/Continue/{id}
        [AllowAnonymous]
        [HttpGet("Continue/{id}")]
        public async Task<ActionResult<Wizard>> ContinueWizard(int id)
        {
            var wizard = await _wizardService.GetWizard(id);
            return Ok(wizard);
        }

        // POST bpm/api/Wizard/SubmitWizard/{id}
        [AllowAnonymous]
        [HttpPost("SubmitWizard/{id}")]
        public async Task<ActionResult<bool>> SubmitWizard(int id)
        {
            await _wizardService.SubmitWizard(id);
            return Ok(true);
        }

        // POST bpm/api/Wizard/SubmitWizard/{id}
        [AllowAnonymous]
        [HttpPost("OverrideWizard/{id}")]
        public async Task<ActionResult<bool>> OverrideWizard(int id)
        {
            await _wizardService.OverrideWizard(id);
            return Ok(true);
        }

        // POST  bpm/api/Wizard/CancelWizard/{id}
        [AllowAnonymous]
        [HttpPost("CancelWizard/{id}")]
        public async Task<ActionResult> CancelWizard(int id)
        {
            await _wizardService.CancelWizard(id);
            return Ok();
        }

        // POST  bpm/api/Wizard/RequestApproval/{id}
        [AllowAnonymous]
        [HttpPost("RequestApproval/{id}")]
        public async Task<ActionResult> RequestApproval(int id)
        {
            await _wizardService.RequestApproval(id);
            return Ok();
        }

        // POST  bpm/api/Wizard/ApproveWizard/{id}
        [AllowAnonymous]
        [HttpPost("ApproveWizard/{id}")]
        public async Task<ActionResult<bool>> ApproveWizard(int id)
        {
            await _wizardService.ApproveWizard(id);
            return Ok(true);
        }

        // POST  bpm/api/Wizard/DisputeWizard
        [AllowAnonymous]
        [HttpPost("DisputeWizard")]
        public async Task<ActionResult> DisputeWizard([FromBody] RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.DisputeWizard(rejectWizardRequest);
            return Ok();
        }

        // POST bpm/api/Wizard/FinalRejectWizard
        [AllowAnonymous]
        [HttpPost("FinalRejectWizard")]
        public async Task<ActionResult> FinalRejectWizard([FromBody] RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.RejectWizard(rejectWizardRequest);
            return Ok();
        }

        // POST bpm/api/Wizard/ExecuteWizardRules/{id}
        [AllowAnonymous]
        [HttpPost("ExecuteWizardRules/{id}")]
        public async Task<ActionResult<RuleRequestResult>> ExecuteWizardRules(int id)
        {
            var submitResult = await _wizardService.ExecuteWizardRules(id);
            return Ok(submitResult);
        }

        // GET bpm/api/Wizard/LastViewed
        [AllowAnonymous]
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Wizard>>> LastViewed()
        {
            var wizards = await _wizardService.LastViewed();
            return Ok(wizards);
        }

        // POST bpm/api/Wizard/RenameWizard/{id}/{name}
        [AllowAnonymous]
        [HttpPost("RenameWizard/{id}/{name}")]
        public async Task<ActionResult<bool>> RenameWizard(int id, string name)
        {
            await _wizardService.EditWizardName(id, name);
            return Ok(true);
        }

        [AllowAnonymous]
        [HttpGet("GetWizardName/{id}")]
        public async Task<ActionResult<Wizard>> GetWizardName(int id)
        {
            var wizard = await _wizardService.GetWizardNameOnly(id);
            return Ok(wizard);
        }

        [AllowAnonymous]
        [HttpGet("GetWizardByLinkedItemId/{linkedItemId}")]
        public async Task<ActionResult<Wizard>> GetWizardByLinkedItemId(int linkedItemId)
        {
            var wizard = await _wizardService.GetWizardByLinkedItemId(linkedItemId);
            return Ok(wizard);
        }

        // POST bpm/api/Wizard/RejectOnCondition
        [AllowAnonymous]
        [HttpPost("RejectOnCondition")]
        public async Task<ActionResult> RejectOnCondition([FromBody] RejectWizardRequest rejectWizardRequest)
        {
            await _wizardService.RejectOnCondition(rejectWizardRequest);
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("GetWizardsByTypeAndLinkedItemId/{linkedItemId}/{type}")]
        public async Task<ActionResult<Wizard>> GetWizardsByTypeAndLinkedItemId(int linkedItemId, string type)
        {
            var wizard = await _wizardService.GetWizardsByTypeAndLinkedItemId(type, linkedItemId);
            return Ok(wizard);
        }

        [AllowAnonymous]
        [HttpGet("GetWizardsInProgresByTypeAndLinkedItemId/{linkedItemId}/{type}")]
        public async Task<ActionResult<List<Wizard>>> GetWizardsInProgresByTypeAndLinkedItemId(int linkedItemId, string type)
        {
            var wizards = await _wizardService.GetWizardsInProgressByTypeAndLinkedItemId(type, linkedItemId);
            return Ok(wizards);
        }

        [AllowAnonymous]
        [HttpGet("GetWizardsByTypeAndId/{id}/{type}")]
        public async Task<ActionResult<Wizard>> GetWizardsByTypeAndId(int id, string type)
        {
            var wizard = await _wizardService.GetWizardsByTypeAndId(type, id);
            return Ok(wizard);
        }

        // GET bpm/api/Wizard/GetUserWizardsByWizardConfigsAndEmail/{wizardConfigIds}
        [AllowAnonymous]
        [HttpGet("GetUserWizardsByWizardConfigsAndEmail/{wizardConfigIds}/{email}/{userRoleId}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetUserWizardsByWizardConfigsAndEmail(string wizardConfigIds, string email, int userRoleId)
        {
            var ids = wizardConfigIds?.Split(',').Select(int.Parse).ToList();
            var wizards = await _wizardService.GetUserWizardsByWizardConfigsAndEmail(ids, email, userRoleId);
            wizards = wizards.OrderByDescending(wizard => wizard.CreatedDate).ToList();
            return Ok(wizards);
        }

        // GET bpm/api/Wizard/GetPortalUserWizards
        [AllowAnonymous]
        [HttpGet("GetPortalUserWizards/{email}/{userRoleId}")]
        public async Task<ActionResult<IEnumerable<Wizard>>> GetPortalUserWizards(string email, int userRoleId)
        {
            var wizards = await _wizardService.GetPortalUserWizards(email, userRoleId);
            wizards = wizards.OrderByDescending(wizard => wizard.Id).ToList();
            return Ok(wizards);
        }
    }
}