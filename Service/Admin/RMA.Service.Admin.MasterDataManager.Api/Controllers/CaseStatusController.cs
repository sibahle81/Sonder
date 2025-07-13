using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CaseStatusController : RmaApiController
    {
        private readonly ICaseStatusService _caseStatusRepository;

        public CaseStatusController(ICaseStatusService caseStatusRepository)
        {
            _caseStatusRepository = caseStatusRepository;
        }

        // GET: mdm/api/CaseStatus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            return Ok(await _caseStatusRepository.GetCaseStatuses());
        }
    }
}