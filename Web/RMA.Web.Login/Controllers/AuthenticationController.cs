using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Web.Login.Extensions;
using RMA.Web.Login.Providers;

using System;
using System.Security;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Web.Login.Controllers
{
    public class AuthenticationController : Controller
    {
        [HttpGet("~/signin"), AllowAnonymous]
        public ActionResult SignIn(string returnUrl = null)
        {
            // Note: the "returnUrl" parameter corresponds to the endpoint the user agent
            // will be redirected to after a successful authentication and not
            // the redirect_uri of the requesting client application.
            ViewBag.ReturnUrl = HttpUtility.UrlEncode(returnUrl);

            // Note: in a real world application, you'd probably prefer creating a specific view model.
            return View("SignIn");
        }

        [HttpPost("~/signin"), AllowAnonymous]
        public async Task<ActionResult> SignIn(string username, string password, string returnUrl)
        {
            ModelState.Clear();

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                return BadRequest();
            }

            var thisUrl = HttpUtility.UrlDecode(returnUrl);
            if (string.IsNullOrEmpty(thisUrl)) thisUrl = "/";
            ViewData["ReturnUrl"] = thisUrl;

            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
                var identity = await AuthorizationProvider.UserLogin(username, password, "ServerCookie", ipAddress);
                var properties = new AuthenticationProperties
                {
                    RedirectUri = thisUrl
                };

                await HttpContext.SignInAsync(new ClaimsPrincipal(identity), properties);

                return Redirect(thisUrl);
            }
            catch (Exception ex)
            {
                //TODO handle invalid creds nicely
                ModelState.AddModelError(string.Empty, "The username or password is incorrect");
                ViewBag.ReturnURL = thisUrl;
                return View("SignIn");

                //return Challenge(new AuthenticationProperties { RedirectUri = thisUrl }, "ServerCookie");

                throw new SecurityException("invalid credentials", ex);
            }
        }

        [HttpGet("~/providersignin")]
        public async Task<ActionResult> ProviderSignIn(string provider, string returnUrl)
        {
            // Note: the "provider" parameter corresponds to the external
            // authentication provider choosen by the user agent.
            if (string.IsNullOrEmpty(provider))
            {
                return BadRequest();
            }

            if (!await HttpContext.IsProviderSupportedAsync(provider).ConfigureAwait(false))
            {
                return BadRequest();
            }

            // Note: the "returnUrl" parameter corresponds to the endpoint the user agent
            // will be redirected to after a successful authentication and not
            // the redirect_uri of the requesting client application.
            if (string.IsNullOrEmpty(returnUrl))
            {
                return BadRequest();
            }

            // Instruct the middleware corresponding to the requested external identity
            // provider to redirect the user agent to its own authorization endpoint.
            // Note: the authenticationScheme parameter must match the value configured in Startup.cs
            return Challenge(new AuthenticationProperties { RedirectUri = returnUrl }, provider);
        }

        [HttpGet("~/signout"), HttpPost("~/signout")]
        public ActionResult SignOut()
        {
            // Instruct the cookies middleware to delete the local cookie created
            // when the user agent is redirected from the external identity provider
            // after a successful authentication flow (e.g Google or Facebook).
            return SignOut("ServerCookie");
        }
    }
}
