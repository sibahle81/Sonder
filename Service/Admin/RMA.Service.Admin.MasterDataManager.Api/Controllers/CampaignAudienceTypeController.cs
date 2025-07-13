using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class CampaignAudienceTypeController : RmaApiController
    {
        private readonly ICampaignAudienceTypeService _audienceTypeRepository;

        public CampaignAudienceTypeController(ICampaignAudienceTypeService audienceTypeRepository)
        {
            _audienceTypeRepository = audienceTypeRepository;
        }

        // GET: mdm/api/CampaignAudienceType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var campaignCategories = await _audienceTypeRepository.GetCampaignAudienceTypes();
            return Ok(campaignCategories);
        }
    }
}