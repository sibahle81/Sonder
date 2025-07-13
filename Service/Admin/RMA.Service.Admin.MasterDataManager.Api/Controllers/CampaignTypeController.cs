using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CampaignTypeController : RmaApiController
    {
        private readonly ICampaignTypeService _campaignTypeRepository;

        public CampaignTypeController(ICampaignTypeService campaignTypeRepository)
        {
            _campaignTypeRepository = campaignTypeRepository;
        }

        // GET: mdm/api/CampaignType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var campaignTypes = await _campaignTypeRepository.GetCampaignTypes();
            return Ok(campaignTypes);
        }
    }
}