using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AnnouncementRoleController : RmaApiController
    {
        private readonly IAnnouncementRoleService _announcementRoleRepository;

        public AnnouncementRoleController(IAnnouncementRoleService announcementRoleRepository)
        {
            _announcementRoleRepository = announcementRoleRepository;
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post(AnnouncementRole announcementRole)
        {
            var id = await _announcementRoleRepository.AddAnnouncementRole(announcementRole);
            return Ok(id);
        }

        [HttpPut]
        public async Task<ActionResult> Put(AnnouncementRole announcementRole)
        {
            await _announcementRoleRepository.EditAnnouncementRole(announcementRole);
            return Ok();
        }

        [HttpDelete("RemoveAnnouncementRolesByAnnouncementId/{announcementId}")]
        public async Task<ActionResult> RemoveAnnouncementRolesByAnnouncementId(int announcementId)
        {
            await _announcementRoleRepository.RemoveAnnouncementRolesByAnnouncementId(announcementId);
            return Ok();
        }

        // GET: mdm/api/AnnouncementRole/GetAnnouncementRoles
        [HttpGet("GetAnnouncementRoles")]
        public async Task<ActionResult<IEnumerable<AnnouncementRole>>> GetAnnouncementRoles()
        {
            var announcementRoles = await _announcementRoleRepository.GetAnnouncementRoles();
            return Ok(announcementRoles);
        }

        // GET: mdm/api/AnnouncementRole/GetAnnouncementRolesByAnnouncementId/{announcementId}
        [HttpGet("GetAnnouncementRolesByAnnouncementId/{announcementId}")]
        public async Task<ActionResult<IEnumerable<AnnouncementRole>>> GetAnnouncementRolesByAnnouncementId(int announcementId)
        {
            var announcementRoles = await _announcementRoleRepository.GetAnnouncementRolesByAnnouncementId(announcementId);
            return Ok(announcementRoles);
        }
    }
}