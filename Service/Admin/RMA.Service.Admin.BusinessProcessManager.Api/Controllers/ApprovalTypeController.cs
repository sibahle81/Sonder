using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Api.Controllers
{
    public class ApprovalTypeController : RmaApiController
    {
        private readonly IApprovalTypeService _approvalTypeService;

        public ApprovalTypeController(IApprovalTypeService approvalTypeService)
        {
            _approvalTypeService = approvalTypeService;
        }

        // GET: bpm/api/ApprovalType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var approvalTypes = await _approvalTypeService.GetApprovalTypes();
            return Ok(approvalTypes);
        }
    }
}