using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.RulesManager.Api.Controllers
{
    public class TestRuleController : RmaApiController
    {
        private readonly IRuleHost _ruleHost;

        public TestRuleController(IRuleHost ruleHost)
        {
            _ruleHost = ruleHost;
        }

        // GET: rul/api/RuleType/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<RuleResult>>> Get(int id)
        {
            var request = new RuleRequest
            { Data = "{\"Age\": " + id + "}", RuleNames = new List<string> { "Example Rule" } };

            var result = await _ruleHost.Execute(request);
            return Ok(result);
        }
    }
}