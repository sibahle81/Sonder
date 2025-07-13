using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ContactTypeController : RmaApiController
    {
        private readonly IContactTypeService _contactTypeRepository;

        public ContactTypeController(IContactTypeService contactTypeRepository)
        {
            _contactTypeRepository = contactTypeRepository;
        }

        // GET: mdm/api/ContactType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var contactTypes = await _contactTypeRepository.GetContactTypes();
            return Ok(contactTypes);
        }
    }
}