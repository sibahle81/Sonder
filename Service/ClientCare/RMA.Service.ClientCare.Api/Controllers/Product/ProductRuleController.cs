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

    public class ProductRuleController : RmaApiController
    {
        private readonly IProductRuleService _productRuleService;

        public ProductRuleController(IProductRuleService productRuleService)
        {
            _productRuleService = productRuleService;
        }

        // GET clc/api/Product/ProductRule/{productId}
        [HttpGet("{productId}")]
        public async Task<ActionResult<IEnumerable<RuleItem>>> Get(int productId)
        {
            var productRules = await _productRuleService.GetProductRules(productId);
            return Ok(productRules);
        }

    }
}