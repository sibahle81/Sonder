using AspNet.Security.OpenIdConnect.Extensions;
using AspNet.Security.OpenIdConnect.Primitives;
using AspNet.Security.OpenIdConnect.Server;

using CommonServiceLocator;

using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

using RMA.Common.Extensions;
using RMA.Web.Login.Models;
using RMA.Web.Login.Security;

using System;
using System.Diagnostics;
using System.Linq;
using System.Security;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace RMA.Web.Login.Providers
{
    public sealed class AuthorizationProvider : OpenIdConnectServerProvider
    {
        private readonly ApplicationContext _database;

        public AuthorizationProvider(ApplicationContext database)
        {
            _database = database;
        }

        public override Task MatchEndpoint(MatchEndpointContext context)
        {
            if (context == null) return Task.CompletedTask;
            // Note: by default, OpenIdConnectServerHandler only handles authorization requests made to the authorization endpoint.
            // This notification handler uses a more relaxed policy that allows extracting authorization requests received at
            // /connect/authorize/accept and /connect/authorize/deny (see AuthorizationModule.cs for more information).
            if (context.Options.AuthorizationEndpointPath.HasValue
                && context.Request.Path.StartsWithSegments(context.Options.AuthorizationEndpointPath))
            {
                context.MatchAuthorizationEndpoint();
            }

            return Task.CompletedTask;
        }

        public override async Task ValidateAuthorizationRequest(ValidateAuthorizationRequestContext context)
        {
            if (context == null) return;
            // Note: the OpenID Connect server middleware supports the authorization code, implicit and hybrid flows
            // but this authorization provider only accepts authorization code or hybrid flow authorization requests
            // that don't result in an access token being returned directly from the authorization endpoint.
            // You may consider relaxing it to support the implicit flow. In this case, consider adding checks
            // rejecting implicit/hybrid authorization requests when the client is a confidential application.

            if (!context.Request.IsAuthorizationCodeFlow() && !context.Request.IsHybridFlow() && !context.Request.IsAuthorizationRequest())
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.UnsupportedResponseType,
                    description: "Only response_type=code and response_type=id_token or " +
                                 "response_type=code id_token are supported by this authorization server.");

                return;
            }

            // Note: to support custom response modes, the OpenID Connect server middleware doesn't
            // reject unknown modes before the ApplyAuthorizationResponse event is invoked.
            // To ensure invalid modes are rejected early enough, a check is made here.
            if (!string.IsNullOrEmpty(context.Request.ResponseMode) && !context.Request.IsFormPostResponseMode()
                                                                       && !context.Request.IsFragmentResponseMode()
                                                                       && !context.Request.IsQueryResponseMode())
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidRequest,
                    description: "The specified 'response_mode' is unsupported.");

                return;
            }

            // Retrieve the application details corresponding to the requested client_id.
            var application = await (from entity in _database.Applications
                                     where entity.ApplicationID == context.ClientId
                                     select entity).SingleOrDefaultAsync();

            if (application == null)
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "The specified client identifier is invalid.");

                return;
            }

            if (!context.RedirectUri.Contains("localhost")
                && !context.RedirectUri.Contains("rma.msft")
                && !string.IsNullOrEmpty(context.RedirectUri)
                && !context.RedirectUri.StartsWith(application.RedirectUri,StringComparison.OrdinalIgnoreCase))
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "The specified 'redirect_uri' is invalid.");

                return;
            }


            if (!context.RedirectUri.Contains("localhost") && !context.RedirectUri.Contains("rma.msft"))
            {
                context.Validate(application.RedirectUri);
            }
            else
            {
                context.Validate(context.RedirectUri);
            }
        }

        public override async Task ValidateTokenRequest(ValidateTokenRequestContext context)
        {
            if (context == null) return;
            // Reject the token request that don't use grant_type=password or grant_type=refresh_token.
            if (!context.Request.IsPasswordGrantType()
                && !context.Request.IsRefreshTokenGrantType()
                && !context.Request.IsAuthorizationCodeGrantType()
                && !context.Request.IsClientCredentialsGrantType())
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.UnsupportedGrantType,
                    description: "Only resource owner password credentials, client credentials and refresh token " +
                                 "are accepted by this authorization server");
                return;
            }

            // Skip client authentication if the client identifier is missing.
            // Note: ASOS will automatically ensure that the calling application
            // cannot use an authorization code or a refresh token if it's not
            // the intended audience, even if client authentication was skipped.
            if (string.IsNullOrEmpty(context.ClientId))
            {
                context.Skip();
                return;
            }

            // Retrieve the application details corresponding to the requested client_id.
            var application = await (from entity in _database.Applications
                                     where entity.ApplicationID == context.ClientId
                                     select entity).SingleOrDefaultAsync();

            if (application == null)
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "The specified client identifier is invalid.");

                return;
            }

            if (application.ApplicationType == ApplicationType.Public)
            {
                // Reject tokens requests containing a client_secret
                // if the client application is not confidential.
                if (!string.IsNullOrEmpty(context.ClientSecret))
                {
                    context.Reject(
                        error: OpenIdConnectConstants.Errors.InvalidRequest,
                        description: "Public clients are not allowed to send a client_secret.");
                    return;
                }
                // If client authentication cannot be enforced, call context.Skip() to inform
                // the OpenID Connect server middleware that the caller cannot be fully trusted.
                context.Skip();
                return;
            }

            // Confidential applications MUST authenticate
            // to protect them from impersonation attacks.
            if (string.IsNullOrEmpty(context.ClientSecret))
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "Missing credentials: ensure that you specified a client_secret.");
                return;
            }

            // Note: to mitigate brute force attacks, you SHOULD strongly consider applying
            // a key derivation function like PBKDF2 to slow down the secret validation process.
            // You SHOULD also consider using a time-constant comparer to prevent timing attacks.
            // For that, you can use the CryptoHelper library developed by @henkmollema:
            // https://github.com/henkmollema/CryptoHelper. If you don't need .NET Core support,
            // SecurityDriven.NET/inferno is a rock-solid alternative: http://securitydriven.net/inferno/
            if (!string.Equals(context.ClientSecret, application.Secret, StringComparison.Ordinal))
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "Invalid credentials: ensure that you specified a correct client_secret.");
                return;
            }

            context.Validate();
        }

        public override async Task ValidateLogoutRequest(ValidateLogoutRequestContext context)
        {
            // When provided, post_logout_redirect_uri must exactly
            // match the address registered by the client application.

            if (context == null) return;

            if (!context.PostLogoutRedirectUri.Contains("localhost")
               && !context.PostLogoutRedirectUri.Contains("rma.msft"))
            {
                if (!string.IsNullOrEmpty(context.PostLogoutRedirectUri)
                && !await _database.Applications.AnyAsync(application => application.LogoutRedirectUri == context.PostLogoutRedirectUri))
                {
                    context.Reject(
                        error: OpenIdConnectConstants.Errors.InvalidRequest,
                        description: "The specified 'post_logout_redirect_uri' is invalid.");

                    return;
                }
            }


            context.Validate();
        }

        public override async Task HandleTokenRequest(HandleTokenRequestContext context)
        {
            if (context == null)
            {
                return;
            }


            // Only handle grant_type=password token requests and let
            // the OpenID Connect server handle the other grant types.
            if (context.Request.IsPasswordGrantType())
            {
                try
                {
                    var ipAddress = context.HttpContext.Connection.RemoteIpAddress.ToString();
                    var identity = await UserLogin(context.Request.Username, context.Request.Password, OpenIdConnectServerDefaults.AuthenticationScheme, ipAddress);

                    var ticket = new AuthenticationTicket(
                        new ClaimsPrincipal(identity),
                        new AuthenticationProperties(),
                        context.Scheme.Name);

                    // Call SetScopes with the list of scopes you want to grant
                    // (specify offline_access to issue a refresh token).
                    // Scopes are identifiers for resources that a client wants to access. 
                    ticket.SetScopes(
                        OpenIdConnectConstants.Scopes.OpenId,
                        OpenIdConnectConstants.Scopes.Email,
                        OpenIdConnectConstants.Scopes.Profile,
                        OpenIdConnectConstants.Scopes.OfflineAccess
                        );

                    var resources = await _database.Applications.Where(r => r.ApplicationID.StartsWith("RmaSF.",StringComparison.Ordinal)).Select(r => r.ApplicationID).ToListAsync();
                    
                    ticket.SetResources(resources);

                    ticket.SetTokenId(identity.Claims.First(c => c.Type == RmaClaimTypes.Token).Value);

                    context.Validate(ticket);
                    return;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                    context.Reject(
                        error: OpenIdConnectConstants.Errors.InvalidGrant,
                        description: "Invalid user credentials. " + ex.Message);
                    return;
                }
            }

            if (context.Request.IsClientCredentialsGrantType())
            {
                var identity = new ClaimsIdentity(new GenericIdentity(context.Request.ClientId, OpenIdConnectServerDefaults.AuthenticationScheme));

                identity.AddClaim(new Claim(OpenIdConnectConstants.Claims.Subject, "0"));
                identity.AddClaim(new Claim(RmaClaimTypes.Token, Guid.NewGuid().ToString()));
                identity.AddClaim(new Claim(RmaClaimTypes.Username, context.Request.ClientId));

                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(
                    principal,
                    new AuthenticationProperties(),
                    context.Scheme.Name);

                // Call SetScopes with the list of scopes you want to grant
                // (specify offline_access to issue a refresh token).
                // Scopes are identifiers for resources that a client wants to access. 
                ticket.SetScopes(
                    OpenIdConnectConstants.Scopes.OpenId,
                    OpenIdConnectConstants.Scopes.Email,
                    OpenIdConnectConstants.Scopes.Profile,
                    OpenIdConnectConstants.Scopes.OfflineAccess
                );

                //The authentication ticket was rejected because the mandatory subject claim was missing.
                var resources = await _database.Applications.Where(r => r.ApplicationID.StartsWith("RmaSF.", StringComparison.OrdinalIgnoreCase)).Select(r => r.ApplicationID).ToListAsync();
                // Set the resources servers the access token should be issued for.
                ticket.SetResources(resources);

                ticket.SetTokenId(Guid.NewGuid().ToString());

                context.Validate(ticket);

                return;
            }

            await base.HandleTokenRequest(context);
        }

        internal static async Task<ClaimsIdentity> UserLogin(string username, string password, string authenticationType, string ipAddress = null)
        {
            var service = ServiceLocator.Current.GetInstance<RMA.Service.Admin.SecurityManager.Contracts.Interfaces.IAuthenticationService>();
            var result = await service.AuthenticateUser(username, password, ipAddress);

            if (result == null)
            {
                throw new SecurityException("user not found in database");
            }

            var identity = new ClaimsIdentity(authenticationType,
                RmaClaimTypes.Name,
                RmaClaimTypes.RoleName);

            identity.AddClaim(RmaClaimTypes.UserId, result.Id.ToString());

            identity.AddClaim(RmaClaimTypes.Username, username,
                    OpenIdConnectConstants.Destinations.AccessToken,
                    OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.RoleId, result.RoleId.ToString(),
                    OpenIdConnectConstants.Destinations.AccessToken,
                    OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.AuthenticationTypeId, result.AuthenticationTypeId.ToString(),
                    OpenIdConnectConstants.Destinations.AccessToken,
                    OpenIdConnectConstants.Destinations.IdentityToken);

            if (!string.IsNullOrEmpty(result.DisplayName))
            {
                identity.AddClaim(RmaClaimTypes.Name, result.DisplayName,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (!string.IsNullOrEmpty(result.RoleName))
            {
                identity.AddClaim(RmaClaimTypes.RoleName, result.RoleName,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (!string.IsNullOrEmpty(result.Email))
            {
                identity.AddClaim(RmaClaimTypes.Email, result.Email,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (!string.IsNullOrEmpty(result.Token))
            {
                identity.AddClaim(RmaClaimTypes.Token, result.Token,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (!string.IsNullOrEmpty(result.Preferences))
            {
                identity.AddClaim(RmaClaimTypes.Preferences, result.Preferences,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }
            if (!string.IsNullOrEmpty(ipAddress))
            {

                identity.AddClaim(RmaClaimTypes.ipdAddress, ipAddress,
                   OpenIdConnectConstants.Destinations.AccessToken,
                   OpenIdConnectConstants.Destinations.IdentityToken);
            }

            if (result?.TenantId > 0)
            {
                identity.AddClaim(RmaClaimTypes.TenantId, result.TenantId.ToString(),
                        OpenIdConnectConstants.Destinations.AccessToken,
                        OpenIdConnectConstants.Destinations.IdentityToken);
            }

            identity.AddClaim(RmaClaimTypes.IsInternalUser, result.IsInternalUser.ToString(),
                    OpenIdConnectConstants.Destinations.AccessToken,
                    OpenIdConnectConstants.Destinations.IdentityToken);

            identity.AddClaim(RmaClaimTypes.PortalTypeId, result.PortalTypeId.ToString(),
                 OpenIdConnectConstants.Destinations.AccessToken,
                 OpenIdConnectConstants.Destinations.IdentityToken);

            return identity;
        }

        public override async Task HandleIntrospectionRequest(HandleIntrospectionRequestContext context)
        {
            if (context == null) return;
            Debug.Assert(context.Ticket != null, "The authentication ticket shouldn't be null.");
            Debug.Assert(!string.IsNullOrEmpty(context.Request.ClientId), "The client_id parameter shouldn't be null.");

            if (context.Request.ClientId.StartsWith("RmaSF.", StringComparison.OrdinalIgnoreCase))
            {
                context.Active = true;
                return;
            }

            var identifier = context.Ticket.Principal.FindFirst(RmaClaimTypes.Token).Value;
            Debug.Assert(!string.IsNullOrEmpty(identifier), "The authentication ticket should contain a token identifier.");

            var username = context.Ticket.Principal.FindFirst(RmaClaimTypes.Username).Value;
            Debug.Assert(!string.IsNullOrEmpty(username), "The authentication ticket should contain a username.");

            if (!context.Ticket.IsAccessToken())
            {
                context.Active = false;
            }

            // Note: the OpenID Connect server middleware allows authorized presenters (e.g relying parties) to introspect
            // tokens but OpenIddict uses a stricter policy that only allows resource servers to use the introspection endpoint.
            // For that, an error is automatically returned if no explicit audience is attached to the authentication ticket.
            if (!context.Ticket.HasAudience())
            {
                context.Active = false;
            }

            if (!context.Ticket.HasAudience(context.Request.ClientId))
            {
                context.Active = false;
            }

            //Validate the token is the active token for the user.
            if (!context.Issuer.Contains("localhost"))
            {
                var service = ServiceLocator.Current.GetInstance<RMA.Service.Admin.SecurityManager.Contracts.Interfaces.IAuthenticationService>();
                var valid = await service.ValidateUserToken(username, identifier);
                if (!valid)
                {
                    context.Active = false;
                }
                context.Issuer = context.Issuer.Replace("http://", "https://");
            }
        }

        public override async Task ValidateIntrospectionRequest(ValidateIntrospectionRequestContext context)
        {
            if (context == null) return;
            // Note: the OpenID Connect server middleware supports unauthenticated introspection requests
            // but OpenIddict uses a stricter policy preventing unauthenticated/public applications
            // from using the introspection endpoint, as required by the specifications.
            // See https://tools.ietf.org/html/rfc7662#section-2.1 for more information.
            if (string.IsNullOrEmpty(context.ClientId) || string.IsNullOrEmpty(context.ClientSecret))
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidRequest,
                    description: "The mandatory 'client_id' and/or 'client_secret' parameters are missing.");

                return;
            }

            // Retrieve the application details corresponding to the requested client_id.
            var application = await (from entity in _database.Applications
                                     where entity.ApplicationID == context.ClientId
                                     select entity).SingleOrDefaultAsync();

            // Retrieve the application details corresponding to the requested client_id.
            //var application = await _applicationManager.FindByClientIdAsync(context.ClientId);
            if (application == null)
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "The specified 'client_id' parameter is invalid.");
                return;
            }

            // Reject the request if the application is not allowed to use the introspection endpoint.
            // Reject introspection requests sent by public applications.
            if (!application.IntrospectionAllowed || application.ApplicationType == ApplicationType.Public)
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.UnauthorizedClient,
                    description: "This client application is not allowed to use the introspection endpoint.");
                return;
            }

            // Validate the client credentials.
            if (application.Secret != context.ClientSecret)
            {
                context.Reject(
                    error: OpenIdConnectConstants.Errors.InvalidClient,
                    description: "The specified client credentials are invalid.");

                return;
            }
            context.Validate();
        }
    }
}
