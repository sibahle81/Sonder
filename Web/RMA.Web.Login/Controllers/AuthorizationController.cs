using AspNet.Security.OpenIdConnect.Extensions;
using AspNet.Security.OpenIdConnect.Primitives;
using AspNet.Security.OpenIdConnect.Server;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using RMA.Web.Login.Models;
using RMA.Web.Login.Security;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Web.Login.Controllers
{
    public class AuthorizationController : Controller
    {
        private readonly ApplicationContext _database;

        public AuthorizationController(ApplicationContext database)
        {
            _database = database;
        }

        [Authorize, HttpGet("~/connect/authorize")]
        public async Task<IActionResult> Authorize(CancellationToken cancellationToken)
        {
            // Note: when a fatal error occurs during the request processing, an OpenID Connect response
            // is prematurely forged and added to the ASP.NET context by OpenIdConnectServerHandler.
            // You can safely remove this part and let ASOS automatically handle the unrecoverable errors
            // by switching ApplicationCanDisplayErrors to false in Startup.cs.
            var response = HttpContext.GetOpenIdConnectResponse();

            if (response != null)
            {
                return View("Error", response);
            }

            // Extract the authorization request from the ASP.NET environment.
            var request = HttpContext.GetOpenIdConnectRequest();
            if (request == null)
            {
                return View("Error", new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.ServerError,
                    ErrorDescription = "An internal error has occurred."
                });
            }

            // Note: ASOS automatically ensures that an application corresponds to the client_id specified
            // in the authorization request by calling OpenIdConnectServerProvider.ValidateAuthorizationRequest.
            // In theory, this null check shouldn't be needed, but a race condition could occur if you
            // manually removed the application details from the database after the initial check made by ASOS.
            var application = await GetApplicationAsync(request.ClientId, cancellationToken)
                .ConfigureAwait(false);

            if (application == null)
            {
                return View("Error", new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.InvalidClient,
                    ErrorDescription = "The specified client identifier is invalid."
                });
            }

            // Create a new ClaimsIdentity containing the claims that
            // will be used to create an id_token, a token or a code.
            // Create a new ClaimsIdentity containing the claims that
            // will be used to create an id_token, a token or a code.
            var identity = new ClaimsIdentity(
                OpenIdConnectServerDefaults.AuthenticationScheme,
                OpenIdConnectConstants.Claims.Name,
                OpenIdConnectConstants.Claims.Role);

            // Note: the "sub" claim is mandatory and an exception is thrown if this claim is missing.
            identity.AddClaim(RmaClaimTypes.UserId, User.FindFirst(RmaClaimTypes.UserId).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.Username, User.FindFirst(RmaClaimTypes.Username).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.RoleId, User.FindFirst(RmaClaimTypes.RoleId).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.AuthenticationTypeId, User.FindFirst(RmaClaimTypes.AuthenticationTypeId).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.TenantId, User.FindFirst(RmaClaimTypes.TenantId).Value,
             OpenIdConnectConstants.Destinations.AccessToken,
             OpenIdConnectConstants.Destinations.IdentityToken);

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Name))
            {
                identity.AddClaim(RmaClaimTypes.Name, User.FindFirst(RmaClaimTypes.Name).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.RoleName))
            {
                identity.AddClaim(RmaClaimTypes.RoleName, User.FindFirst(RmaClaimTypes.RoleName).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Email))
            {
                identity.AddClaim(RmaClaimTypes.Email, User.FindFirst(RmaClaimTypes.Email).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Token))
            {
                identity.AddClaim(RmaClaimTypes.Token, User.FindFirst(RmaClaimTypes.Token).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Preferences))
            {
                identity.AddClaim(RmaClaimTypes.Preferences, User.FindFirst(RmaClaimTypes.Preferences).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            // Create a new authentication ticket holding the user identity.
            var ticket = new AuthenticationTicket(
                new ClaimsPrincipal(identity),
                new AuthenticationProperties(),
                OpenIdConnectServerDefaults.AuthenticationScheme);

            // Set the list of scopes granted to the client application.
            // Note: this sample always grants the "openid", "email" and "profile" scopes
            // when they are requested by the client application: a real world application
            // would probably display a form allowing to select the scopes to grant.
            // Scopes are identifiers for resources that a client wants to access. 
            ticket.SetScopes(new[]
            {
                OpenIdConnectConstants.Scopes.OpenId,
                OpenIdConnectConstants.Scopes.Email,
                OpenIdConnectConstants.Scopes.Profile,
                OpenIdConnectConstants.Scopes.OfflineAccess
            }.Intersect(request.GetScopes()));

            // Set the resources servers the access token should be issued for.
            var resources = await _database.Applications.Where(r => r.ApplicationID.StartsWith("RmaSF", StringComparison.OrdinalIgnoreCase)).Select(r => r.ApplicationID).ToListAsync(cancellationToken: cancellationToken);
            ticket.SetResources(resources);

            ticket.SetTokenId(identity.Claims.First(c => c.Type == RmaClaimTypes.Token).Value);

            // Returning a SignInResult will ask ASOS to serialize the specified identity to build appropriate tokens.
            return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
        }

        [Authorize, HttpPost("~/connect/authorize/accept"), ValidateAntiForgeryToken]
        public async Task<IActionResult> Accept(CancellationToken cancellationToken)
        {
            var response = HttpContext.GetOpenIdConnectResponse();
            if (response != null)
            {
                return View("Error", response);
            }

            var request = HttpContext.GetOpenIdConnectRequest();
            if (request == null)
            {
                return View("Error", new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.ServerError,
                    ErrorDescription = "An internal error has occurred."
                });
            }

            var application = await GetApplicationAsync(request.ClientId, cancellationToken);

            if (application == null)
            {
                return View("Error", new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.InvalidClient,
                    ErrorDescription = "The specified client identifier is invalid."
                });
            }

            // Create a new ClaimsIdentity containing the claims that
            // will be used to create an id_token, a token or a code.
            // Create a new ClaimsIdentity containing the claims that
            // will be used to create an id_token, a token or a code.
            var identity = new ClaimsIdentity(
                OpenIdConnectServerDefaults.AuthenticationScheme,
                OpenIdConnectConstants.Claims.Name,
                OpenIdConnectConstants.Claims.Role);

            // Note: the "sub" claim is mandatory and an exception is thrown if this claim is missing.
            identity.AddClaim(RmaClaimTypes.UserId, User.FindFirst(RmaClaimTypes.UserId).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.Username, User.FindFirst(RmaClaimTypes.Username).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.RoleId, User.FindFirst(RmaClaimTypes.RoleId).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.AuthenticationTypeId, User.FindFirst(RmaClaimTypes.AuthenticationTypeId).Value,
                OpenIdConnectConstants.Destinations.AccessToken,
                OpenIdConnectConstants.Destinations.IdentityToken);

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Name))
            {
                identity.AddClaim(RmaClaimTypes.Name, User.FindFirst(RmaClaimTypes.Name).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.RoleName))
            {
                identity.AddClaim(RmaClaimTypes.RoleName, User.FindFirst(RmaClaimTypes.RoleName).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Email))
            {
                identity.AddClaim(RmaClaimTypes.Email, User.FindFirst(RmaClaimTypes.Email).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Token))
            {
                identity.AddClaim(RmaClaimTypes.Token, User.FindFirst(RmaClaimTypes.Token).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (User.HasClaim(c => c.Type == RmaClaimTypes.Preferences))
            {
                identity.AddClaim(RmaClaimTypes.Preferences, User.FindFirst(RmaClaimTypes.Preferences).Value,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            // Create a new authentication ticket holding the user identity.
            var ticket = new AuthenticationTicket(
                new ClaimsPrincipal(identity),
                new AuthenticationProperties(),
                OpenIdConnectServerDefaults.AuthenticationScheme);

            // Set the list of scopes granted to the client application.
            // Note: this sample always grants the "openid", "email" and "profile" scopes
            // when they are requested by the client application: a real world application
            // would probably display a form allowing to select the scopes to grant.
            // Scopes are identifiers for resources that a client wants to access. 
            ticket.SetScopes(new[]
            {
                OpenIdConnectConstants.Scopes.OpenId,
                OpenIdConnectConstants.Scopes.Email,
                OpenIdConnectConstants.Scopes.Profile,
                OpenIdConnectConstants.Scopes.OfflineAccess
            }.Intersect(request.GetScopes()));

            // Set the resources servers the access token should be issued for.
            var resources = await _database.Applications.Where(r => r.ApplicationID.StartsWith("RmaSF", StringComparison.OrdinalIgnoreCase)).Select(r => r.ApplicationID).ToListAsync(cancellationToken: cancellationToken);
            ticket.SetResources(resources);

            ticket.SetTokenId(identity.Claims.First(c => c.Type == RmaClaimTypes.Token).Value);

            // Returning a SignInResult will ask ASOS to serialize the specified identity to build appropriate tokens.
            return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
        }

        [Authorize, HttpPost("~/connect/authorize/deny"), ValidateAntiForgeryToken]
        public IActionResult Deny(CancellationToken cancellationToken)
        {
            var response = HttpContext.GetOpenIdConnectResponse();
            if (response != null)
            {
                return View("Error", response);
            }

            // Notify ASOS that the authorization grant has been denied by the resource owner.
            // Note: OpenIdConnectServerHandler will automatically take care of redirecting
            // the user agent to the client application using the appropriate response_mode.
            return Challenge(OpenIdConnectServerDefaults.AuthenticationScheme);
        }

        [HttpGet("~/connect/logout")]
        public async Task<ActionResult> Logout()
        {
            var response = HttpContext.GetOpenIdConnectResponse();
            if (response != null)
            {
                return View("Error", response);
            }

            // When invoked, the logout endpoint might receive an unauthenticated request if the server cookie has expired.
            // When the client application sends an id_token_hint parameter, the corresponding identity can be retrieved
            // using AuthenticateAsync or using User when the authorization server is declared as AuthenticationMode.Active.
            var result = await HttpContext.AuthenticateAsync(OpenIdConnectServerDefaults.AuthenticationScheme).ConfigureAwait(false);

            var request = HttpContext.GetOpenIdConnectRequest();
            if (request == null)
            {
                return View("Error", new OpenIdConnectResponse
                {
                    Error = OpenIdConnectConstants.Errors.ServerError,
                    ErrorDescription = "An internal error has occurred."
                });
            }
            return SignOut("ServerCookie", OpenIdConnectServerDefaults.AuthenticationScheme);
        }

        [HttpPost("~/connect/logout"), ValidateAntiForgeryToken]
        public ActionResult Logout(CancellationToken cancellationToken)
        {
            // Returning a SignOutResult will ask the cookies middleware to delete the local cookie created when
            // the user agent is redirected from the external identity provider after a successful authentication flow
            // and will redirect the user agent to the post_logout_redirect_uri specified by the client application.
            return SignOut("ServerCookie", OpenIdConnectServerDefaults.AuthenticationScheme);
        }

        protected virtual Task<Application> GetApplicationAsync(string identifier, CancellationToken cancellationToken)
        {
            // Retrieve the application details corresponding to the requested client_id.
            return _database.Applications
                .Where(application => application.ApplicationID == identifier)
                .SingleOrDefaultAsync(cancellationToken);
        }
    }
}
