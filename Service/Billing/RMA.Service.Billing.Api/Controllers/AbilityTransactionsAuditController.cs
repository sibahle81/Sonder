using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/Billing/[controller]")]
    public class AbilityTransactionsAuditController : RmaApiController
    {
        private readonly IAbilityTransactionsAuditService _abilityTransactionsAuditService;

        public AbilityTransactionsAuditController(IAbilityTransactionsAuditService abilityTransactionsAuditService)
        {
            _abilityTransactionsAuditService = abilityTransactionsAuditService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AbilityTransactionsAudit>>> Get()
        {
            var abilityPostingAudits = await _abilityTransactionsAuditService.GetAbilityPostingAudits();
            return Ok(abilityPostingAudits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AbilityTransactionsAudit>> Get(int id)
        {
            var abilityPostingAudit = await _abilityTransactionsAuditService.GetAbilityPostingAudit(id);
            return Ok(abilityPostingAudit);
        }

        [HttpGet("ProcessAudits")]
        public async Task<ActionResult> ProcessAudits()
        {
            await _abilityTransactionsAuditService.ProcessTransactionsForPosting();
            return Ok();
        }

        [HttpGet("GetAbilityPostingAuditByRef/{reference}")]
        public async Task<ActionResult<List<AbilityTransactionsAudit>>> GetAbilityPostingAuditByRef(string reference)
        {
            var abilityPostingAudits = await _abilityTransactionsAuditService.GetAbilityPostingAuditByRef(reference);
            return Ok(abilityPostingAudits);
        }
    }
}
