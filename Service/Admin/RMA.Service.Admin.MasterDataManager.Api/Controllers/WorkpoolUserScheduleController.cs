using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class WorkpoolUserScheduleController : RmaApiController
    {
        private readonly IWorkpoolUserScheduleService _WorkpoolUserScheduleService;

        public WorkpoolUserScheduleController(IWorkpoolUserScheduleService WorkpoolUserScheduleService)
        {
            _WorkpoolUserScheduleService = WorkpoolUserScheduleService;
        }

        //mdm/api/WorkpoolUserSchedule
        [HttpPost("AddMonthlyScheduleWorkpoolUser")]
        public async Task<ActionResult<bool>> AddMonthlyScheduleWorkpoolUser([FromBody] List<MonthlyScheduledWorkPoolUser> monthlyScheduledWorkPoolUsers)
        {
            var result = await _WorkpoolUserScheduleService.AddMonthlyScheduleWorkpoolUser(monthlyScheduledWorkPoolUsers);
            return Ok(result);
        }

        [HttpGet("GetMonthlyScheduleWorkpoolUser/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<MonthlyScheduledWorkPoolUser>>> GetMonthlyScheduleWorkpoolUser(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var result = await _WorkpoolUserScheduleService.GetMonthlyScheduleWorkpoolUser(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }


    }
}
