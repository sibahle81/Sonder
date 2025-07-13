using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.RulesManager.Api.Controllers
{
    public class RulesEngineController : RmaApiController
    {
        private readonly IRuleEngineService _ruleEngineService;
        public RulesEngineController(IRuleEngineService ruleEngineService)
        {
            _ruleEngineService = ruleEngineService;
        }

        // GET: rul/api/RulesEngine/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RuleMetadata>> Get(int id)
        {
            var rule = await _ruleEngineService.GetRule(id);
            return Ok(rule);
        }

        // POST rul/api/RulesEngine/{request}
        [HttpPost]
        public async Task<ActionResult<RuleResult>> Post([FromBody] RuleRequest request)
        {
            var ruleResults = await _ruleEngineService.ExecuteRules(request);
            return Ok(ruleResults);
        }
    }
}