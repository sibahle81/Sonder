using CommonServiceLocator;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using System.Threading.Tasks;

namespace RMA.Web.Login.Controllers
{
    public class UserinfoController : Controller
    {
        // Specify ActiveAuthenticationSchemes = "Bearer" to ensure the principal extracted from
        // the access token sent by the client application is correctly attached to the HTTP context.
        [Authorize(AuthenticationSchemes = "Bearer")]
        [HttpGet("~/connect/userinfo")]
        public async Task<IActionResult> Get()
        {
            var permissionService = ServiceLocator.Current.GetInstance<RMA.Service.Admin.SecurityManager.Contracts.Interfaces.IUserService>();
            var info = await permissionService.GetUserInfo();
            return Json(info);
        }
    }
}
