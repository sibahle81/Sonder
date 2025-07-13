using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PublicHolidayController : RmaApiController
    {
        private readonly IPublicHolidayService _publicHolidayRepository;

        public PublicHolidayController(IPublicHolidayService publicHolidayRepository)
        {
            _publicHolidayRepository = publicHolidayRepository;
        }

        // GET: mdm/api/PublicHoliday
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PublicHoliday>>> Get()
        {
            var publicHolidays = await _publicHolidayRepository.GetPublicHolidays();
            return Ok(publicHolidays);
        }

        // GET: mdm/api/PublicHoliday/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicHoliday>> Get(int id)
        {
            var publicHoliday = await _publicHolidayRepository.GetPublicHoliday(id);
            return Ok(publicHoliday);
        }

        // POST: mdm/api/PublicHoliday/{publicHoliday}
        [HttpPost]
        public async Task<ActionResult<int>> Post(PublicHoliday publicHoliday)
        {
            var id = await _publicHolidayRepository.AddPublicHoliday(publicHoliday);
            return Ok(id);
        }

        // PUT: mdm/api/PublicHoliday/{publicHoliday}
        [HttpPut]
        public async Task<ActionResult> Put(PublicHoliday publicHoliday)
        {
            await _publicHolidayRepository.EditPublicHoliday(publicHoliday);
            return Ok();
        }

        // DELETE: mdm/api/PublicHoliday/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _publicHolidayRepository.RemovePublicHoliday(id);
            return Ok();
        }
    }
}