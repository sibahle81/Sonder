using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    public class PasswordResetAuthorisationController : RmaApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IPasswordResetAuthorizationService _passwordResetAuthorizationService;

        public PasswordResetAuthorisationController(
            IPasswordResetAuthorizationService passwordResetAuthorizationService
            , IAuthenticationService authenticationService)
        {
            _passwordResetAuthorizationService = passwordResetAuthorizationService;
            _authenticationService = authenticationService;
        }

        // POST: sec/api/PasswordResetAuthorization/{passwordResetAuthorization}
        [HttpPost]
        public async Task<ActionResult<AuthenticationResult>> Post(
            [FromBody] PasswordResetAuthorization passwordResetAuthorization)
        {
            if (passwordResetAuthorization != null)
            {
                passwordResetAuthorization.Token = await _authenticationService.GenerateAuthenticationToken();
                var result =
                    await _passwordResetAuthorizationService.SavePasswordResetAuthorization(passwordResetAuthorization);
                return Ok(result);
            }
            return Ok();
        }

        // GET sec/api/PasswordResetAuthorization/GetUser/{token}
        [HttpGet("GetUser/{token}")]
        public async Task<ActionResult<PasswordResetAuthorization>> GetPasswordResetAuthorization(string token)
        {
            var user = await _passwordResetAuthorizationService.GetPasswordResetAuthorization(token);
            return Ok(user);
        }
    }
}