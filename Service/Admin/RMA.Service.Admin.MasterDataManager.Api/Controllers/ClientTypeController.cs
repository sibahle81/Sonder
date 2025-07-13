using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ClientTypeController : RmaApiController
    {
        private readonly IClientTypeService _clientTypeRepository;

        public ClientTypeController(IClientTypeService clientTypeRepository)
        {
            _clientTypeRepository = clientTypeRepository;
        }

        // GET: mdm/api/ClientType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var clientTypes = await _clientTypeRepository.GetClientTypes();
            return Ok(clientTypes);
        }
    }
}