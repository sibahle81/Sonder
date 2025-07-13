using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CountryController : RmaApiController
    {
        private readonly ICountryService _countryRepository;

        public CountryController(ICountryService countryRepository)
        {
            _countryRepository = countryRepository;
        }

        // GET: mdm/api/Country
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Country>>> Get()
        {
            var countries = await _countryRepository.GetCountries();
            return Ok(countries);
        }

        // GET: mdm/api/Country/{countryId}
        [HttpGet("{countryId}")]
        public async Task<ActionResult<Country>> Get(int countryId)
        {
            var stateProvinces = await _countryRepository.GetCountryById(countryId);
            return Ok(stateProvinces);
        }

        // GET: mdm/api/Country/ByName/{name}
        [HttpGet("ByName/{name}")]
        public async Task<ActionResult<Country>> ByName(string name)
        {
            return Ok(await _countryRepository.GetCountryByName(name));
        }
    }
}