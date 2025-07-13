using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class StateProvinceController : RmaApiController
    {
        private readonly IStateProvinceService _stateProvinceRepository;

        public StateProvinceController(IStateProvinceService stateProvinceRepository)
        {
            _stateProvinceRepository = stateProvinceRepository;
        }

        // GET: mdm/api/StateProvince
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StateProvince>>> Get()
        {
            var stateProvinces = await _stateProvinceRepository.GetStateProvinces();
            return Ok(stateProvinces);
        }

        // GET: mdm/api/StateProvince/ByName/{name}
        [HttpGet("ByName/{name}")]
        /* this route becomes api/[controller]/IsFirstNumberBigger */
        public async Task<ActionResult<StateProvince>> GetStateProvinceByName(string name)
        {
            var statesProvince = await _stateProvinceRepository.GetStateProvinceByName(name);
            return Ok(statesProvince);
        }

        // GET: mdm/api/StateProvince/{countryId}
        [HttpGet("{countryId}")]
        public async Task<ActionResult<IEnumerable<StateProvince>>> Get(int countryId)
        {
            var stateProvinces = await _stateProvinceRepository.GetStateProvincesByCountry(countryId);
            return Ok(stateProvinces);
        }
    }
}