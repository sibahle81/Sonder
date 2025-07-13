using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class SkillCategoryController : RmaApiController
    {
        private readonly ISkillCategoryService _skillCategoryRepository;

        public SkillCategoryController(ISkillCategoryService skillCategoryRepository)
        {
            _skillCategoryRepository = skillCategoryRepository;
        }

        // GET: mdm/api/SkillCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SkillCategory>>> Get()
        {
            var skillcategories = await _skillCategoryRepository.GetSkillCategories();
            return Ok(skillcategories);
        }

        // GET: mdm/api/SkillCategory/ByName/{name}
        [HttpGet("ByName/{name}")]
        public async Task<ActionResult<SkillCategory>> ByName(string name)
        {
            var skillCategory = await _skillCategoryRepository.GetSkillCategoryByName(name);
            return Ok(skillCategory);
        }
    }
}