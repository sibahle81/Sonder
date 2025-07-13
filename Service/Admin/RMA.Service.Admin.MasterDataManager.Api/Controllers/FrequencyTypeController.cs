using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class FrequencyTypeController : RmaApiController
    {
        private readonly IFrequencyTypeService _frequencyTypeRepository;

        public FrequencyTypeController(IFrequencyTypeService frequencyTypeRepository)
        {
            _frequencyTypeRepository = frequencyTypeRepository;
        }

        // GET: mdm/api/FrequencyType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var frequencyTypes = await _frequencyTypeRepository.GetFrequencyTypes();
            return Ok(frequencyTypes);
        }
    }
}