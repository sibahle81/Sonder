using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.CampaignManager.Api.Controllers
{
    public class ReminderController : RmaApiController
    {
        private readonly IReminderService _reminderService;

        public ReminderController(IReminderService reminderService)
        {
            _reminderService = reminderService;
        }

        [HttpGet("Campaign/{campaignId}")]
        public async Task<ActionResult<Reminder>> Get(int campaignId)
        {
            var reminder = await _reminderService.GetCampaignReminder(campaignId);
            return Ok(reminder);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Reminder reminder)
        {
            var id = await _reminderService.AddCampaignReminder(reminder);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Reminder reminder)
        {
            await _reminderService.EditCampaignReminder(reminder);
            return Ok();
        }

        [HttpPost("SendReminders")]
        public async Task<ActionResult<int>> SendReminders()
        {
            var count = await _reminderService.SendReminders();
            return Ok(count);
        }
    }
}