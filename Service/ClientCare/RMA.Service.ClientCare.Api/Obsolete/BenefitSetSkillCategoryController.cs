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

    public class BenefitSetSkillCategoryController : RmaApiController
    {
        private readonly IBenefitSetSkillCategoryService _benefitSetSkillCategoryService;

        public BenefitSetSkillCategoryController(IBenefitSetSkillCategoryService benefitSetSkillCategoryService)
        {
            _benefitSetSkillCategoryService = benefitSetSkillCategoryService;
        }

        // GET clc/api/Product/BenefitSetSkillCategory/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<BenefitSetSkillCategory>>> Get(int id)
        {
            var benefitSkillCategories = await _benefitSetSkillCategoryService.GetBenefitSetSkillCategories(id);
            return Ok(benefitSkillCategories);
        }

        // GET clc/api/Product/BenefitSetSkillCategory/Lookup/{id}
        [HttpGet("Lookup/{id}")]
        public async Task<ActionResult<IEnumerable<BenefitSetSkillCategory>>> GetBenefitIds(int id)
        {
            var skillCatagoriIds = await _benefitSetSkillCategoryService.GetSkillCategoryIdsByBenefitSet(id);
            return Ok(skillCatagoriIds);
        }
    }
}