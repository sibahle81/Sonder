using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AddressTypeController : RmaApiController
    {
        private readonly IAddressTypeService _addressTypeRepository;

        public AddressTypeController(IAddressTypeService addressTypeRepository)
        {
            _addressTypeRepository = addressTypeRepository;
        }

        // GET: mdm/api/AddressType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var addressTypes = await _addressTypeRepository.GetAddressTypes();
            return Ok(addressTypes);
        }
    }
}