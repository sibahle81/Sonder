using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CityController : RmaApiController
    {
        private readonly ICityService _cityRepository;

        public CityController(ICityService cityRepository)
        {
            _cityRepository = cityRepository;
        }

        // GET: mdm/api/City
        [HttpGet]
        public async Task<ActionResult<IEnumerable<City>>> Get()
        {
            var cities = await _cityRepository.GetCities();
            return Ok(cities);
        }

        // GET: mdm/api/City
        [HttpGet("GetCityById/{cityId}")]
        public async Task<ActionResult<City>> GetCityById(int cityId)
        {
            var cities = await _cityRepository.GetCityById(cityId);
            return Ok(cities);
        }

        // GET: mdm/api/City/{provinceId}
        [HttpGet("{provinceId}")]
        public async Task<ActionResult<IEnumerable<City>>> Get(int provinceId)
        {
            var cities = await _cityRepository.GetCityByProvince(provinceId);
            return Ok(cities);
        }

        // GET: mdm/api/City/ByName/{name}
        [HttpGet("ByName/{name}")]
        public async Task<ActionResult<City>> ByName(string name)
        {
            var result = await _cityRepository.GetCityByName(name);
            return Ok(result);
        }


        // GET: mdm/api/City/SearchAddress/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")
        [HttpGet("SearchAddress/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<List<CityRetrieval>>> SearchClientAddress(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var address = await _cityRepository.SearchClientAddress(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(address);
        }


    }
}