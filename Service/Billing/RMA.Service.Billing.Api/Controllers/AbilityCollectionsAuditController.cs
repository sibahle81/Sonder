using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/Billing/[controller]")]
    public class AbilityCollectionsAuditController : RmaApiController
    {
        private readonly IAbilityCollectionsAuditService _abilityCollectionsAuditService;

        public AbilityCollectionsAuditController(IAbilityCollectionsAuditService abilityCollectionsAuditService)
        {
            _abilityCollectionsAuditService = abilityCollectionsAuditService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AbilityCollectionsAudit>>> Get()
        {
            var abilityPostingAudits = await _abilityCollectionsAuditService.GetAbilityPostingAudits();
            return Ok(abilityPostingAudits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AbilityCollectionsAudit>> Get(int id)
        {
            var abilityPostingAudit = await _abilityCollectionsAuditService.GetAbilityPostingAudit(id);
            return Ok(abilityPostingAudit);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] AbilityCollectionsAudit abilityPostingAudit)
        {
            var res = await _abilityCollectionsAuditService.AddAbilityPostingAudit(abilityPostingAudit);
            return Ok(res);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _abilityCollectionsAuditService.RemoveAbilityPostingAudit(id);
            return Ok();
        }
    }
}
