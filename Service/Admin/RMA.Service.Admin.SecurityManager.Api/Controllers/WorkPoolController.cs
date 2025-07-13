using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class WorkPoolController : RmaApiController
    {
        private readonly IWorkPoolService _workPoolService;

        public WorkPoolController(IWorkPoolService workPoolService)
        {
            _workPoolService = workPoolService;
        }

        // GET sec/api/WorkPool
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkPool>>> Get()
        {
            var workPools = await _workPoolService.Get();
            return Ok(workPools);
        }
    }
}