using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AddressLookUpController : RmaApiController
    {
        private readonly IAddressLookUpService _addressLookUpRepository;


        public AddressLookUpController(IAddressLookUpService addressLookUpRepository)
        {
            _addressLookUpRepository = addressLookUpRepository;
        }

        // GET: mdm/api/AddressType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var addressTypes = await _addressLookUpRepository.GetCities();
            return Ok(addressTypes);
        }
    }
}