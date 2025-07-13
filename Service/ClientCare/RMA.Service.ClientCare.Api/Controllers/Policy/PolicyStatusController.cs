using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;


// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PolicyStatusController : RmaApiController
    {
        private readonly IPolicyStatusService _policyStatusService;

        public PolicyStatusController(IPolicyStatusService policyStatusService)
        {
            _policyStatusService = policyStatusService;
        }

        // GET clc/api/Policy/PolicyStatus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var statusList = await _policyStatusService.GetPolicyStatuses();
            return Ok(statusList);
        }
    }
}