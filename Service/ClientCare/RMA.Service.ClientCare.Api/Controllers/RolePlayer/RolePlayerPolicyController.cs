using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.RolePlayer
{
    [Route("api/RolePlayer/[controller]")]
    public class RolePlayerPolicyController : RmaApiController
    {
        private readonly IRolePlayerPolicyService _policyService;

        public RolePlayerPolicyController(
            IRolePlayerPolicyService policyService)
        {
            _policyService = policyService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RolePlayerPolicy>> Get(int policyId)
        {
            var policy = await _policyService.GetRolePlayerPolicy(policyId);
            return Ok(policy);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerPolicy>>> SearchPolicies(int page = 1, int pageSize = 5, string orderBy = "PolicyId", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.SearchPolicies(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpGet]
        [Route("ByPolicyIds/{ids}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> ByPolicyIds(List<int> policyIds)
        {
            return Ok(await _policyService.GetPoliciesByIds(policyIds));
        }

        [HttpGet("GetRolePlayerPolicyByNumber/{policyNumber}")]
        public async Task<ActionResult<RolePlayerPolicy>> GetRolePlayerPolicyByNumber(string policyNumber)
        {
            var policy = await _policyService.GetRolePlayerPolicyByNumber(policyNumber);
            return Ok(policy);
        }

        [HttpGet("GetRolePlayerAmendments/{rolePlayerId}/{policyId}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerPolicy>>> GetRolePlayerAmendments(int rolePlayerId, int policyId)
        {
            var policy = await _policyService.GetRolePlayerAmendments(rolePlayerId, policyId);
            return Ok(policy);
        }

        [HttpGet("VerifyPolicyExists/{policyNumber}")]
        public async Task<ActionResult<int>> VerifyPolicyExists(string policyNumber)
        {
            var policyId = await _policyService.VerifyPolicyExists(policyNumber);
            return Ok(policyId);
        }

        [HttpPost("CancelRequestGroupPolicyChild/{policyId}/{status}")]
        public async Task<ActionResult<int>> CancelRequestGroupPolicyChild(int policyId, int status)
        {
            var success = await _policyService.CancelRequestGroupPolicyChild(policyId, status);
            return Ok(success);
        }

        [HttpPost("PolicySearchMoreInfo/{policyId}/{rolePlayerId}")]
        public async Task<ActionResult<string>> PolicySearchMoreInfo(int policyId, int rolePlayerId)
        {
            var success = await _policyService.PolicySearchMoreInfo(policyId, rolePlayerId);
            return Ok(success);
        }

        [HttpGet("GetGroupPolicyStatus/{policyId}")]
        public async Task<ActionResult<int>> GetGroupPolicyStatus(int policyId)
        {
            var status = await _policyService.GetGroupPolicyStatus(policyId);
            return Ok(status);
        }

        [HttpGet("SearchPoliciesForCase/{query}")]
        public async Task<ActionResult<List<RolePlayerPolicy>>> SearchPoliciesForCase(string query)
        {
            var policies = await _policyService.SearchPoliciesForCase(query);
            return Ok(policies);
        }

        [HttpGet("GetPoliciesByRepresentativeId/{representativeId}")]
        public async Task<ActionResult<List<RolePlayerPolicy>>> GetPoliciesByRepresentativeId(int representativeId)
        {
            var policies = await _policyService.GetPoliciesByRepresentativeId(representativeId);
            return Ok(policies);
        }

        [HttpGet("SearchPoliciesByRolePlayerForCase/{rolePlayerId}")]
        public async Task<ActionResult<List<RolePlayerPolicy>>> SearchPoliciesByRolePlayerForCase(int rolePlayerId)
        {
            var policies = await _policyService.SearchPoliciesByRolePlayerForCase(rolePlayerId);
            return Ok(policies);
        }

        [HttpGet("VerifyPolicyMovementExists/{refNumber}")]
        public async Task<ActionResult<PolicyMovement>> VerifyPolicyMovementExists(string refNumber)
        {
            var result = await _policyService.VerifyPolicyMovementExists(refNumber);
            return Ok(result);
        }

        [HttpPut("UpdatePolicyStatus")]
        public async Task<bool> UpdatePolicyStatus([FromBody] RolePlayerPolicy rolePlayerPolicy)
        {
            return await _policyService.UpdatePolicyStatus(rolePlayerPolicy);
        }

        [HttpGet("GetInsuredLivesToContinuePolicy/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> GetInsuredLivesToContinuePolicy(int page = 1, int pageSize = 5, string orderBy = "RolePlayerId", string sortDirection = "asc", string query = "0")
        {
            var policies = await _policyService.GetInsuredLivesToContinuePolicy(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpGet("GetPolicyWithNoReferenceData/{rolePlayerPolicyId}")]
        public async Task<ActionResult<List<RolePlayerPolicy>>> GetPolicyWithNoReferenceData(int rolePlayerPolicyId)
        {
            var policies = await _policyService.GetRolePlayerPolicyWithNoReferenceData(rolePlayerPolicyId);
            return Ok(policies);
        }

        [HttpGet("GetPoliciesByPolicyOwnerIdNoRefData/{rolePlayerId}")]
        public async Task<ActionResult<List<RolePlayerPolicy>>> GetPoliciesByPolicyOwnerIdNoRefData(int rolePlayerId)
        {
            var policies = await _policyService.GetPoliciesByPolicyOwnerIdNoRefData(rolePlayerId);
            return Ok(policies);
        }

        [HttpGet("GetPoliciesByPolicyPayeeIdNoRefData/{rolePlayerId}")]
        public async Task<ActionResult<List<RolePlayerPolicy>>> GetPoliciesByPolicyPayeeIdNoRefData(int rolePlayerId)
        {
            var policies = await _policyService.GetPoliciesByPolicyPayeeIdNoRefData(rolePlayerId);
            return Ok(policies);
        }

        [HttpPut("EditRolePlayerPolicies")]
        public async Task<ActionResult> EditRolePlayerPolicies([FromBody] List<RolePlayerPolicy> roleplayerPolicies)
        {
            await _policyService.EditRolePlayerPolicies(roleplayerPolicies);
            return Ok();
        }

        [HttpGet("LapsePoliciesNotTakenUp")]
        public async Task<ActionResult<bool>> LapsePoliciesNotTakenUp()
        {
            var result = await _policyService.MonitorPendingFirstPremiumPolicies("roleplayer policy facade");
            return Ok(result);
        }

        [HttpGet("CancelPolicies")]
        public async Task<ActionResult<bool>> CancelPolicies()
        {
            var result = await _policyService.CancelPolicies();
            return Ok(result);
        }

        [HttpGet("SearchCoidPolicies/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerPolicy>>> SearchCoidPolicies(int page = 1, int pageSize = 5, string orderBy = "PolicyId", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.SearchCoidPolicies(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpPost("UploadInsuredLives")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> UploadInsuredLives([FromBody] FileContentImport content)
        {
            var res = await _policyService.UploadInsuredLives(content);
            return Ok(res);
        }

        [HttpPost("ImportPolicyInsuredLives")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> ImportPolicyMembers([FromBody] ImportInsuredLivesRequest importRequest)
        {
            var summary = await _policyService.ImportInsuredLives(importRequest);
            return Ok(summary);
        }

        [HttpGet("InsuredLivesImportErrors/{fileIdentifier}")]
        public async Task<ActionResult<int>> InsuredLivesImportErrors(string fileIdentifier)
        {
            var result = await _policyService.InsuredLivesImportErrors(fileIdentifier);
            return Ok(result);
        }

        [HttpGet("CancelPolicy/{policyNumber}")]
        public async Task<ActionResult<bool>> CancelPolicy(string policyNumber)
        {
            var result = await _policyService.CancelPolicy(policyNumber);
            return Ok(result);
        }
    }
}
