using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class LoginController : RmaApiController
    {
        private readonly IAuthenticationService _authenticationService;

        public LoginController(IAuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        // POST: sec/api/Login/{user}
        [HttpPost]
        public async Task<ActionResult<User>> Post([FromBody] User user)
        {
            var result = await _authenticationService.AuthenticateUser(user?.Email, user.Password, "");
            return Ok(result);
        }

        [AllowAnonymous, HttpGet("ForgotPassword/{username}")]
        public async Task<ActionResult<User>> ForgotPassword(string username)
        {
            var result = await _authenticationService.ForgotPassword(username);
            return Ok(result);
        }

        [AllowAnonymous, HttpPost("ValidateUserToken")]
        public async Task<ActionResult<bool>> ValidateUserToken([FromBody] User user)
        {
            var result = await _authenticationService.VerifyUserToken(user);
            return Ok(result);
        }
    }
}