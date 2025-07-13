using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class BenefitRuleController : RmaApiController
    {
        private readonly IBenefitRuleService _benefitRuleService;

        public BenefitRuleController(IBenefitRuleService benefitRuleService)
        {
            _benefitRuleService = benefitRuleService;
        }

        // GET: clc/api/Product/BenefitRule/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<RuleItem>>> Get(int id)
        {
            var benefitRules = await _benefitRuleService.GetBenefitRules(id);
            return Ok(benefitRules);
        }
    }
}