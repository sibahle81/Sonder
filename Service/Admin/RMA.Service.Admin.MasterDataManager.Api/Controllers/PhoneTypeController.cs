using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PhoneTypeController : RmaApiController
    {
        private readonly IPhoneTypeService _phoneTypeRepository;

        public PhoneTypeController(IPhoneTypeService phoneTypeRepository)
        {
            _phoneTypeRepository = phoneTypeRepository;
        }

        // GET: mdm/api/PhoneType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var phoneTypes = await _phoneTypeRepository.GetPhoneTypes();
            return Ok(phoneTypes);
        }
    }
}