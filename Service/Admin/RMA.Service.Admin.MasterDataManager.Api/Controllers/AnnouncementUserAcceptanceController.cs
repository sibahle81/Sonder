using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AnnouncementUserAcceptanceController : RmaApiController
    {
        private readonly IAnnouncementUserAcceptanceService _announcementUserAcceptanceRepository;

        public AnnouncementUserAcceptanceController(IAnnouncementUserAcceptanceService announcementUserAcceptanceRepository)
        {
            _announcementUserAcceptanceRepository = announcementUserAcceptanceRepository;
        }

        // POST: mdm/api/AnnouncementUserAcceptance/AddAnnouncementUserAcceptance
        [HttpPost("AddAnnouncementUserAcceptance")]
        public async Task<ActionResult<int>> AddAnnouncementUserAcceptance([FromBody] AnnouncementUserAcceptance announcementUserAcceptance)
        {
            var id = await _announcementUserAcceptanceRepository.AddAnnouncementUserAcceptance(announcementUserAcceptance);
            return Ok(id);
        }
    }
}