using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class InsuredLifeController : RmaApiController
    {
        private readonly IInsuredLifeService _insuredLifeService;

        public InsuredLifeController(IInsuredLifeService insuredLifeService)
        {
            _insuredLifeService = insuredLifeService;
        }

        [HttpGet("GetPolicyInsuredLives/{policyId}")]
        public async Task<ActionResult<List<PolicyInsuredLife>>> GetInsuredLives(int policyId)
        {
            var lives = await _insuredLifeService.GetInsuredLives(policyId);
            return Ok(lives);
        }

        [HttpGet("GroupPolicyOnboardedMembers/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{search}")]
        public async Task<ActionResult<PagedRequestResult<PolicyGroupMember>>> GetGroupPolicyOnboardedMembers(int policyId = 0, int page = 1, int pageSize = 5, string orderBy = "ClientReference", string sortDirection = "asc", string search = null)
        {
            var lives = await _insuredLifeService.GetGroupPolicyOnboardedMembers(policyId, new PagedRequest(search, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(lives);
        }

        [HttpGet("GroupPolicyMainMembers/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{search}")]
        public async Task<ActionResult<PagedRequestResult<PolicyGroupMember>>> GetGroupPolicyMainMembers(int policyId = 0, int page = 1, int pageSize = 5, string orderBy = "ClientReference", string sortDirection = "asc", string search = null)
        {
            var lives = await _insuredLifeService.GetGroupPolicyMainMembers(policyId, new PagedRequest(search, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(lives);
        }

        [HttpGet("GetPagedPolicyInsuredLives/{page}/{pageSize}/{orderBy}/{sortDirection}/{policyId}/{isChildPolicy?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyInsuredLife>>> GetPagedPolicyInsuredLives(int page = 1, int pageSize = 5, string orderBy = "RolePlayerTypeId", string sortDirection = "asc", int policyId = 0, bool isChildPolicy = false)
        {
            var lives = await _insuredLifeService.GetPolicyInsuredLives(new PagedRequest(policyId.ToString(), page, pageSize, orderBy, sortDirection == "asc"), "", 0, isChildPolicy);
            return Ok(lives);
        }

        [HttpGet("GetPagedPolicyInsuredLivesFiltered/{page}/{pageSize}/{orderBy}/{sortDirection}/{policyId}/{filter}/{status}/{isChildPolicy?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyInsuredLife>>> GetPagedPolicyInsuredLivesFiltered(int page = 1, int pageSize = 5, string orderBy = "RolePlayerTypeId", string sortDirection = "asc", int policyId = 0, string filter = "", int status = 0, bool isChildPolicy = false)
        {
            var lives = await _insuredLifeService.GetPolicyInsuredLives(new PagedRequest(policyId.ToString(), page, pageSize, orderBy, sortDirection == "asc"), filter, status, isChildPolicy);
            return Ok(lives);
        }

        [HttpPost("CreatePolicyInsuredLife")]
        public async Task<ActionResult> CreatePolicyInsuredLife([FromBody] PolicyInsuredLife policyInsuredLife)
        {
            var rolePlayerContactId = await _insuredLifeService.CreatePolicyInsuredLife(policyInsuredLife);
            return Ok(rolePlayerContactId);
        }

    }
}