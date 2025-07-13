using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class LocationController : RmaApiController
    {
        private readonly ILocationsService _locationRepository;

        public LocationController(ILocationsService locationRepository)
        {
            _locationRepository = locationRepository;
        }

        // GET: mdm/api/Location
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> Get()
        {
            var countries = await _locationRepository.GetLocations();
            return Ok(countries);
        }
    }
}