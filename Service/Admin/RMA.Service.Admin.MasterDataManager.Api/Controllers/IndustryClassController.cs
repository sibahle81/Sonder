using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class IndustryClassController : RmaApiController
    {
        private readonly IIndustryClassService _industryClassRepository;

        public IndustryClassController(IIndustryClassService industryClassRepository)
        {
            _industryClassRepository = industryClassRepository;
        }

        // GET: mdm/api/IndustryClass
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var industryClasses = await _industryClassRepository.GetIndustryClasses();
            return Ok(industryClasses);
        }
    }
}