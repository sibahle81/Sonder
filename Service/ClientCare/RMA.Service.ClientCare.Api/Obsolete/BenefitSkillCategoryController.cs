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

    public class BenefitSkillCategoryController : RmaApiController
    {
        private readonly IBenefitSkillCategoryService _benefitSkillCategoryService;

        public BenefitSkillCategoryController(IBenefitSkillCategoryService benefitSkillCategoryServiceService)
        {
            _benefitSkillCategoryService = benefitSkillCategoryServiceService;
        }

        // GET clc/api/Product/BenefitSkillCategory/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<BenefitSetSkillCategory>>> Get(int id)
        {
            var benefitSkillCategories = await _benefitSkillCategoryService.GetBenefitSkillCategories(id);
            return Ok(benefitSkillCategories);
        }

        // POST clc/api/Product/BenefitSkillCategory/{benefitSkillCategoryRequest}
        [HttpPost]
        public async Task<ActionResult> PostAsync(
            [FromBody] BenefitSkillCategoryRequest benefitSkillCategoryRequest)
        {
            await _benefitSkillCategoryService.AddBenefitSkillCategory(benefitSkillCategoryRequest);
            return Ok();
        }

        // PUT clc/api/Product/BenefitSkillCategory/{benefitSkillCategoryRequest}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] BenefitSkillCategoryRequest benefitSkillCategoryRequest)
        {
            await _benefitSkillCategoryService.EditBenefitSkillCategory(benefitSkillCategoryRequest);
            return Ok();
        }
    }
}