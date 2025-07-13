using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CommunicationTypeController : RmaApiController
    {
        private readonly ICommunicationTypeService _communicationTypeRepository;

        public CommunicationTypeController(ICommunicationTypeService communicationTypeRepository)
        {
            _communicationTypeRepository = communicationTypeRepository;
        }

        // GET: mdm/api/CommunicationType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var communicationTypes = await _communicationTypeRepository.GetCommunicationTypes();
            return Ok(communicationTypes);
        }

    }
}