using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Entities;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Api.Controllers
{
    public class ScheduledTaskController : RmaApiController
    {
        private readonly IScheduledTaskService _scheduledTaskService;
        public ScheduledTaskController(IScheduledTaskService scheduledTaskService)
        {
            _scheduledTaskService = scheduledTaskService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ScheduledTask>>> Get()
        {
            var scheduledTasks = await _scheduledTaskService.ScheduledTasks();
            return Ok(scheduledTasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduledTask>> Get(int id)
        {
            var scheduledTask = await _scheduledTaskService.GetScheduledTask(id);
            return Ok(scheduledTask);
        }

        [HttpPut]
        public async Task<ActionResult> Put(ScheduledTask scheduledTask)
        {
            await _scheduledTaskService.EditScheduledTask(scheduledTask);
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<bool>> ResetToCurrentDateAndTime(int id)
        {
            var results = await _scheduledTaskService.ResetToCurrentDateAndTime(id);
            return Ok(results);
        }

    }
}
