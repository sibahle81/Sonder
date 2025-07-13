using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.RulesManager.Api.Controllers
{
    public class RuleController : RmaApiController
    {
        private readonly ILastViewedService _lastViewedService;
        private readonly IRuleService _ruleService;

        public RuleController(IRuleService ruleService, ILastViewedService lastViewedService)
        {
            _ruleService = ruleService;
            _lastViewedService = lastViewedService;
        }

        // GET: rul/api/Rule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rule>>> Get()
        {
            var rules = await _ruleService.GetRules(true, false);
            return Ok(rules);
        }

        // GET: rul/api/Rule/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Rule>> Get(int id)
        {
            var rule = await _ruleService.GetRule(id);
            return Ok(rule);
        }

        //POST: rul/api/Rule/{rule}
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Rule rule)
        {
            var id = await _ruleService.AddRule(rule);
            return Ok(id);
        }

        //PUT: rul/api/Rule/{rule}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Rule rule)
        {
            await _ruleService.EditRule(rule);
            return Ok();
        }

        //GET: rul/api/Rule/ByRuleTypeIds/{ids}
        [HttpGet("ByRuleTypeIds/{ids}")]
        public async Task<ActionResult<IEnumerable<Rule>>> GetByRuleTypeIds(string ids)
        {
            var ruleTypes = new List<Rule>();
            if (!string.IsNullOrEmpty(ids))
            {
                var ruleTypeIdList = ids.Split(',').Select(i => Convert.ToInt32(i)).ToList();

                ruleTypes = await _ruleService.GetRulesByTypes(ruleTypeIdList);
            }

            return Ok(ruleTypes);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Rule>>> SearchRules(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var rules = await _ruleService.SearchRulesPaged(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(rules);
        }

        //GET: rul/api/Rule/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Rule>>> LastViewed()
        {
            var rules = await _lastViewedService.GetLastViewedRules();
            return Ok(rules);
        }

        [HttpGet("GetRuleByCode/{code}")]
        public async Task<ActionResult<Rule>> GetRuleByCode(string code)
        {
            return Ok(await _ruleService.GetRuleByCode(code));
        }
    }
}