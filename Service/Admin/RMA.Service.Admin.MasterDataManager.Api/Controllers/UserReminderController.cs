using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Interfaces;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class UserReminderController : RmaApiController
    {
        private readonly IUserReminderService _userReminderService;

        public UserReminderController(IUserReminderService userReminderService)
        {
            _userReminderService = userReminderService;
        }


        [HttpPost("CreateUserReminder")]
        public async Task<ActionResult<int>> CreateReminder([FromBody] UserReminder userReminder)
        {
            var result = await _userReminderService.CreateUserReminder(userReminder);
            return Ok(result);
        }

        [HttpPost("CreateUserReminders")]
        public async Task<ActionResult<int>> CreateReminders([FromBody] List<UserReminder> userReminders)
        {
            var result = await _userReminderService.CreateUserReminders(userReminders);
            return Ok(result);
        }

        [HttpPut("UpdateUserReminder")]
        public async Task<ActionResult<int>> UpdateUserReminder([FromBody] UserReminder userReminder)
        {
            var result = await _userReminderService.UpdateUserReminder(userReminder);
            return Ok(result);
        }

        [HttpPut("UpdateUserReminders")]
        public async Task<ActionResult<int>> UpdateUserReminders([FromBody] List<UserReminder> userReminders)
        {
            var result = await _userReminderService.UpdateUserReminders(userReminders);
            return Ok(result);
        }

        [HttpPost("GetPagedUserReminders")]
        public async Task<ActionResult<PagedRequestResult<UserReminder>>> GetPagedUserReminders([FromBody] UserReminderSearchRequest userReminderSearchRequest)
        {
            var result = await _userReminderService.GetPagedUserReminders(userReminderSearchRequest);
            return Ok(result);
        }

        [HttpPost("CheckUserHasAlerts")]
        public async Task<ActionResult<bool>> CheckUserHasAlerts([FromBody] UserReminder userReminder)
        {
            if (userReminder != null)
            {
                var result = await _userReminderService.CheckUserHasAlerts(Convert.ToInt32(userReminder.AssignedToUserId));
                return Ok(result);
            }
            return Ok(false);
        }

        [HttpPost("CheckMessageCount")]
        public async Task<ActionResult<int>> CheckMessageCount([FromBody] UserReminder userReminder)
        {
            if (userReminder != null)
            {
                var result = await _userReminderService.CheckMessageCount(Convert.ToInt32(userReminder.AssignedToUserId));
                return Ok(result);
            }
            return Ok(0);
        }
    }
}