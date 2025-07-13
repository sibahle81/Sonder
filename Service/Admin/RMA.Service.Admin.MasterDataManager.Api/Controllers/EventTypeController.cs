using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class EventTypeController : RmaApiController
    {
        private readonly IEventTypeService _eventTypeRepository;

        public EventTypeController(IEventTypeService eventTypeRepository)
        {
            _eventTypeRepository = eventTypeRepository;
        }

        // GET: mdm/api/EventType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            return Ok(await _eventTypeRepository.GetEventTypes());
        }
    }
}