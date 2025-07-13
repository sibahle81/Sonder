using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Finance
{
    [Route("api/Finance/[controller]")]
    public class AbilityPostingController : RmaApiController
    {
        private readonly IAbilityPostingService _abilityPostingService;

        public AbilityPostingController(IAbilityPostingService abilityPostingService)
        {
            _abilityPostingService = abilityPostingService;
        }

        //GET: fin/api/Finance/AbilityPosting
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AbilityPosting>>> Get()
        {

            var abilityPostings = await _abilityPostingService.GetAbilityPostings();
            return Ok(abilityPostings);
        }

        //GET: fin/api/Finance/AbilityPosting/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AbilityPosting>> Get(int id)
        {
            var post = await _abilityPostingService.GetAbilityPosting(id);
            return Ok(post);
        }

        //GET: fin/api/Finance/AbilityPosting/ByTranSysNo/{sysNo}
        [HttpGet("ByTranSysNo/{sysNo}")]
        public async Task<ActionResult> ByTranSysNo(int sysNo)
        {
            await _abilityPostingService.GetAbilityPostingByTranSysNo(sysNo);
            return Ok();
        }

        //POST: fin/api/Finance/AbilityPosting/{abilityPosting}
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AbilityPosting abilityPosting)
        {
            var res = await _abilityPostingService.AddAbilityPosting(abilityPosting);
            return Ok(res);
        }

        //PUT: fin/api/Finance/AbilityPosting/{abilityPosting}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] AbilityPosting abilityPosting)
        {
            await _abilityPostingService.EditAbilityPosting(abilityPosting);
            return Ok();
        }

        //DELETE: fin/api/Finance/AbilityPosting/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _abilityPostingService.RemoveAbilityPosting(id);
            return Ok();
        }

        [HttpGet("Process")]
        public async Task<ActionResult<IEnumerable<AbilityPosting>>> SendToAbility()
        {
            var abilityPostings = await _abilityPostingService.GetAbilityPostingsToProcess();
            return Ok(abilityPostings);
        }

        [HttpGet("ProcessAudits")]
        public async Task<ActionResult<IEnumerable<AbilityPosting>>> ProcessAudits()
        {
            await _abilityPostingService.ProcessAbilityPostingItems();
            return Ok();
        }
    }
}