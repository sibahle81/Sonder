using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Api.Controllers
{
    public class ApprovalController : RmaApiController
    {
        private readonly IApprovalService _approvalService;

        public ApprovalController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        // GET: bpm/api/approval
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Approval>>> Get()
        {
            var approval = await _approvalService.GetApprovals();
            return Ok(approval);
        }

        //GET: bpm/api/approval/{itemType}/{itemId}
        [HttpGet("{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<Approval>>> Get(string itemType, int itemId)
        {
            var approvals = await _approvalService.GetApprovalsByTypeAndId(itemType, itemId);
            return Ok(approvals);
        }

        //GET: bpm/api/approval/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Approval>> Get(int id)
        {
            var approval = await _approvalService.GetApprovalById(id);
            return Ok(approval);
        }

        //POST: bpm/api/approval/{approval}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Approval approval)
        {
            var id = await _approvalService.AddApproval(approval);
            return Ok(id);
        }

        //POST: bpm/api/approval/BulkImport/{approvals}
        [HttpPost("BulkImport")]
        public async Task<ActionResult> BulkImport([FromBody] List<Approval> approvals)
        {
            await _approvalService.AddApprovals(approvals);
            return Ok();
        }

        //PUT: bpm/api/approval/{approval}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Approval approval)
        {
            await _approvalService.EditApproval(approval);
            return Ok();
        }
    }
}