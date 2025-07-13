using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class EarningsTypeController : RmaApiController
    {
        private readonly IEarningsTypeService _earningsTypeRepository;

        public EarningsTypeController(IEarningsTypeService earningsTypeRepository)
        {
            _earningsTypeRepository = earningsTypeRepository;
        }

        // GET: mdm/api/EarningsType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var earningsTypes = await _earningsTypeRepository.GetEarningsTypes();
            return Ok(earningsTypes);
        }
    }
}