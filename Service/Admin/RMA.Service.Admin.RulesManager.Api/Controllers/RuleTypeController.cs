using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.RulesManager.Api.Controllers
{
    public class RuleTypeController : RmaApiController
    {
        private readonly IRuleTypeService _ruleTypeService;

        public RuleTypeController(IRuleTypeService ruleTypeService)
        {
            _ruleTypeService = ruleTypeService;
        }

        // GET: rul/api/RuleType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var ruleTypes = await _ruleTypeService.GetRuleTypes();
            return Ok(ruleTypes);
        }
    }
}