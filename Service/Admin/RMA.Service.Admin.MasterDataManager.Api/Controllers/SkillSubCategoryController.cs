using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class SkillSubCategoryController : RmaApiController
    {
        private readonly ISkillSubCategoryService _skillSubCategoryRepository;

        public SkillSubCategoryController(ISkillSubCategoryService skillSubCategoryRepository)
        {
            _skillSubCategoryRepository = skillSubCategoryRepository;
        }

        // GET: mdm/api/SkillSubCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var skillSubCategories = await _skillSubCategoryRepository.GetSkillSubCategories();
            return Ok(skillSubCategories);
        }
    }
}