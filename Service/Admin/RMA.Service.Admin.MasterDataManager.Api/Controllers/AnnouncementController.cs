using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AnnouncementController : RmaApiController
    {
        private readonly IAnnouncementService _announcementRepository;
        private const string DefaultSortOrder = "asc";
        private const string AscendingOrder = "asc";

        public AnnouncementController(IAnnouncementService announcementRepository)
        {
            _announcementRepository = announcementRepository;
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post(Announcement announcement)
        {
            var id = await _announcementRepository.AddAnnouncement(announcement);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put(Announcement announcement)
        {
            await _announcementRepository.EditAnnouncement(announcement);
            return Ok();
        }

        [HttpGet("GetAnnouncements")]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetAnnouncements()
        {
            var announcements = await _announcementRepository.GetAnnouncements();
            return Ok(announcements);
        }

        [HttpGet("GetPagedAnnouncements/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<Announcement>>> GetPagedAnnouncements(int page = 1, int pageSize = 5, string orderBy = "Name", string sortDirection = DefaultSortOrder)
        {
            var announcements = await _announcementRepository.GetPagedAnnouncements(new PagedRequest("", page, pageSize, orderBy, sortDirection == AscendingOrder));
            return Ok(announcements);
        }

        [HttpGet("GetAnnouncementById/{announcementId}")]
        public async Task<ActionResult<Announcement>> GetAnnouncementById(int announcementId)
        {
            var announcement = await _announcementRepository.GetAnnouncementById(announcementId);
            return Ok(announcement);
        }

        [HttpGet("GetAnnouncementsByUserId/{userId}")]
        public async Task<ActionResult<Announcement>> GetAnnouncementsByUserId(int userId)
        {
            var announcements = await _announcementRepository.GetAnnouncementsByUserId(userId);
            return Ok(announcements);
        }

        [HttpGet("GetAnnouncementCountForUserId/{userId}")]
        public async Task<ActionResult<int>> GetAnnouncementCountForUserId(int userId)
        {
            var announcementCount = await _announcementRepository.GetAnnouncementCountForUserId(userId);
            return Ok(announcementCount);
        }
    }
}
