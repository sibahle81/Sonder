using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PolicyCaseController : RmaApiController
    {
        private readonly IPolicyCaseService _caseService;
        public PolicyCaseController(IPolicyCaseService caseService)
        {
            _caseService = caseService;
        }

        [HttpGet("GetCaseByPolicyId/{policyId}")]
        public async Task<ActionResult<Case>> GetCaseByPolicyId(int policyId)
        {
            var result = await _caseService.GetCaseByPolicyId(policyId);
            return Ok(result);
        }

        [HttpGet("GetTotalCoverAmount/{idType}/{idNumber}")]
        public async Task<ActionResult<decimal>> GetTotalCoverAmount(int idType, string idNumber)
        {
            var result = await _caseService.GetTotalCoverAmount((IdTypeEnum)idType, idNumber, 0);
            return Ok(result);
        }
    }
}
