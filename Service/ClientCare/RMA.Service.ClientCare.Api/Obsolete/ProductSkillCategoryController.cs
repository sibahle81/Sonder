using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Product
{
    [Route("api/Product/[controller]")]

    public class ProductSkillCategoryController : RmaApiController
    {
        private readonly IProductSkillCategoryService _productSkillCategoryService;

        public ProductSkillCategoryController(IProductSkillCategoryService productSkillCategoryService)
        {
            _productSkillCategoryService = productSkillCategoryService;
        }

        // GET clc/api/Product/ProductSkillCategory/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<ProductSkillCategory>>> Get(int id)
        {
            var productSkillCategories = await _productSkillCategoryService.GetProductSkillCategories(id);
            return Ok(productSkillCategories);
        }

        // GET clc/api/Product/ProductSkillCategory/Lookup/{id}
        [HttpGet("Lookup/{id}")]
        public async Task<ActionResult<IEnumerable<int>>> GetSkillCategoryIds(int id)
        {
            var ruleIds = await _productSkillCategoryService.GetProductSkillCategoryIdsAsync(id);
            return Ok(ruleIds);
        }

        // POST clc/api/Product/ProductSkillCategory/{productSkillCategoryRequest}
        [HttpPost]
        public async Task<ActionResult> Post(
            [FromBody] ProductSkillCategoryRequest productSkillCategoryRequest)
        {
            await _productSkillCategoryService.AddProductSkillCategory(productSkillCategoryRequest);
            return Ok();
        }

        // PUT clc/api/Product/ProductSkillCategory/{productSkillCategoryRequest}
        [HttpPost]
        public async Task<ActionResult> Put([FromBody] ProductSkillCategoryRequest productSkillCategoryRequest)
        {
            await _productSkillCategoryService.EditProductSkillCategory(productSkillCategoryRequest);
            return Ok();
        }
    }
}