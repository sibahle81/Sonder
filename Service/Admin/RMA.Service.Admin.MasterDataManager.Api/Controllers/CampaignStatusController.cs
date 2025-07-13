using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CampaignStatusController : RmaApiController
    {
        private readonly ICampaignStatusService _repository;

        public CampaignStatusController(ICampaignStatusService repository)
        {
            _repository = repository;
        }

        // GET: mdm/api/CampaignStatus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var list = await _repository.GetAllCampaignStatus();
            return Ok(list);
        }
    }
}