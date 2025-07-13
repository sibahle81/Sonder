using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class ProductOptionRuleController : RmaApiController
    {
        private readonly IProductOptionRuleService _productOptionRuleService;

        public ProductOptionRuleController(IProductOptionRuleService productOptionRuleService)
        {
            _productOptionRuleService = productOptionRuleService;
        }

        //GET: clc/api/Product/ProductOptionRule/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<RuleItem>>> Get(int id)
        {
            var productOptionRules = await _productOptionRuleService.GetProductOptionRules(id);
            return Ok(productOptionRules);
        }

        //GET: clc/api/Product/ProductOptionRule/GetProductOptionRuleByCode/{id}/{ruleCode}
        [HttpGet("GetProductOptionRuleByCode/{productOptionId}/{ruleCode}")]
        public async Task<ActionResult<RuleItem>> GetProductOptionRuleByCode(int productOptionId, string ruleCode)
        {
            var ruleItem = await _productOptionRuleService.GetProductOptionRuleByCode(productOptionId, ruleCode);
            return Ok(ruleItem);
        }
    }
}