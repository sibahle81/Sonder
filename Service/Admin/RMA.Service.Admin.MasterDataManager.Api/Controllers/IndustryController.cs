using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class IndustryController : RmaApiController
    {
        private readonly IIndustryService _industryRepository;

        public IndustryController(IIndustryService industryRepository)
        {
            _industryRepository = industryRepository;
        }

        // GET: mdm/api/Industry
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Industry>>> Get()
        {
            var levels = await _industryRepository.GetIndustries();
            return Ok(levels);
        }

        // GET: mdm/api/Industry/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Industry>> Get(int id)
        {
            var industry = await _industryRepository.GetIndustry(id);
            return Ok(industry);
        }

        // GET: mdm/api/Industry/ByIndustryClassId/{industryClassId}
        [HttpGet("ByIndustryClassId/{industryClass}")]
        public async Task<ActionResult<Industry>> ByIndustryClassId(IndustryClassEnum industryClass)
        {
            var levels = await _industryRepository.GetIndustriesByIndustryClassId(industryClass);
            return Ok(levels);
        }
    }
}