using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class UserPreferenceController : RmaApiController
    {
        private readonly IUserPreferenceService _userPreferenceService;

        public UserPreferenceController(IUserPreferenceService userPreferenceService)
        {
            _userPreferenceService = userPreferenceService;
        }

        // GET sec/api/UserPreference/{id}
        [HttpGet("User/{id}")]
        public async Task<ActionResult<UserPreference>> Get(int id)
        {
            var userPreference = await _userPreferenceService.GetUserPreference(id);
            return Ok(userPreference);
        }

        [HttpGet("ForUser/{userId}")]
        public async Task<ActionResult<UserPreference>> GetForUser(int userId)
        {
            var userPreference = await _userPreferenceService.GetUserPreferenceForUser(userId);
            return Ok(userPreference);
        }

        // GET sec/api/UserPreference/Reset/{id}
        [HttpGet("Reset/{id}")]
        public async Task<ActionResult> ResetUserPreference(int id)
        {
            await _userPreferenceService.ResetUserPreference(id);
            return Ok();
        }

        // POST sec/api/UserPreference/{userPreference}
        [HttpPost]
        public async Task<ActionResult<int>> Post(UserPreference userPreference)
        {
            var id = await _userPreferenceService.SaveUserPreference(userPreference);
            return Ok(id);
        }
    }
}