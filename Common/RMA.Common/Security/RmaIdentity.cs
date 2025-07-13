using CommonServiceLocator;

using RMA.Common.Exceptions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;

namespace RMA.Common.Security
{
    //    Standard OpenID Connect claims:
    //sub {string} The subject(end-user) identifier.This member is always present in a claims set.
    //[name] {string} The full name of the end-user, with optional language tag.
    //[given_name] { string} The given or first name of the end-user, with optional language tag.
    //[family_name] { string} The surname(s) or last name(s) of the end-user, with optional language tag.
    //[middle_name] { string} The middle name of the end-user, with optional language tag.
    //[nickname] { string} The casual name of the end-user, with optional language tag.
    //[preferred_username] { string} The username by which the end-user wants to be referred to at the client application.
    //[profile] { string} The URL of the profile page for the end-user, with optional language tag.
    //[picture] { string} The URL of the profile picture for the end-user.
    //[website] {string} The URL of the end-user's web page or blog.
    //[email] {string} The end-user's preferred email address.
    //[email_verified] {true|false} True if the end-user's email address has been verified, else false.
    //[gender] {"male"|"female"|?} The end-user's gender.
    //[birthdate] {string} The end-user's birthday, represented in ISO 8601:2004 YYYY-MM-DD format. The year may be 0000, indicating that it is omitted. To represent only the year, YYYY format is allowed.
    //[zoneinfo] {string} The end-user's time zone, e.g. Europe/Paris or America/Los_Angeles.
    //[locale] {string} The end-user's locale, represented as a BCP47 language tag. This is typically an ISO 639-1 Alpha-2 language code in lowercase and an ISO 3166-1 Alpha-2 country code in uppercase, separated by a dash. For example, en-US or fr-CA.
    //[phone_number] {string} The end-user's preferred telephone number, typically in E.164 format, for example +1 (425) 555-1212 or +56 (2) 687 2400.
    //[phone_number_verified] {true|false} True if the end-user's telephone number has been verified, else false.
    //[address] {object} A JSON object describing the end-user's preferred postal address with any of the following members:
    //[formatted] {string} The full mailing address, with multiple lines if necessary.Newlines can be represented either as a \r\n or as a \n.
    //[street_address] {string} The street address component, which may include house number, stree name, post office box, and other multi-line information.Newlines can be represented either as a \r\n or as a \n.
    //[locality] { string} City or locality component.
    //[region] { string} State, province, prefecture or region component.
    //[postal_code] { string} Zip code or postal code component.
    //[country] { string} Country name component.
    //[updated_at] {number} Time the end-user's information was last updated, as number of seconds since the Unix epoch (1970-01-01T0:0:0Z) as measured in UTC until the date/time.

    public static class RmaIdentity
    {
        public const string BackendServiceName = "BackendProcess";

        public static bool IsBackendService
        {
            get
            {
                if (IsAuthenticated) return false;
                return true;
            }
        }

        public static string UserToken => GetClaimValue("token");

        public static string TraceId
        {
            get
            {
                if (HasClaim("traceId"))
                    return GetClaimValue("traceId");

                return Guid.NewGuid().ToString();
            }
        }

        public static string AccessToken => GetClaimValue("access_token");

        public static string Username
        {
            get
            {
                if (IsBackendService) return BackendServiceName;

                return GetClaimValue("username");
            }
        }

        public static string UsernameOrBlank
        {
            get
            {
                try
                {
                    return Username;
                }
                catch
                {
                    return BackendServiceName;
                }
            }
        }

        public static int UserId
        {
            get
            {
                var id = GetClaimValue("sub");
                if (!string.IsNullOrWhiteSpace(id))
                    return Convert.ToInt16(id);
                return 0;
            }
        }

        public static int TenantId
        {
            get
            {
                var id = GetClaimValue("tenantId");
                if (!string.IsNullOrWhiteSpace(id))
                    return Convert.ToInt16(id);
                return 0;
            }
        }

        public static string ClientId => GetClaimValue("client_id");

        public static List<int> UserTenantMap
        {
            get
            {
                /** TO DO - Get all tenantIds linked to user **/
                List<int> tenantMap = new List<int>();
                var tenantId = GetClaimValue("tenantId");
                if (!string.IsNullOrWhiteSpace(tenantId)) tenantMap.Add(Convert.ToInt16(tenantId));
                return tenantMap;
            }
        }

        public static string Email => GetClaimValue("email");

        public static bool IsAuthenticated
        {
            get
            {
                if (CurrentIdentity.Claims.All(c => c.Type != "sub")) return false;

                return CurrentIdentity.IsAuthenticated;
            }
        }

        public static IPrincipal CurrentPrincipal => ServiceLocator.Current.GetInstance<IPrincipal>();

        public static ClaimsIdentity CurrentIdentity => (ClaimsIdentity)CurrentPrincipal.Identity;

        public static IEnumerable<Claim> Claims => ((ClaimsPrincipal)CurrentPrincipal).Claims;

        public static int RoleId
        {
            get
            {
                var id = GetClaimValue("roleId");
                if (!string.IsNullOrEmpty(id))
                    return Convert.ToInt16(id);
                return 0;
            }
        }

        public static string DisplayName => GetClaimValue("name");
        public static string Role => GetClaimValue("role");
        public static string Preferences => GetClaimValue("preferences");

        public static bool HasClaim(params string[] claims)
        {
            /** For backend services grant all super magic claims **/
            if (IsBackendService)
                return true;

            var claimIdsRequired = claims.Select(securityClaim => securityClaim).ToList();
            return CurrentIdentity.FindAll("permission").Any(c => claimIdsRequired.Contains(c.Value));
        }

        public static string GetClaimValue(string typeName)
        {
            if (CurrentIdentity.Claims.Any(c => c.Type == typeName))
            {
                var value = CurrentIdentity.FindFirst(typeName).Value;
                return value;
            }

            return string.Empty;
        }

        public static List<int> GetClaimValues(string typeName)
        {
            var claims = CurrentIdentity.FindAll(typeName);
            return claims.Select(claim => Convert.ToInt32(claim.Value)).ToList();
        }

        public static void DemandPermission(string requiredPermission)
        {
            var hasClaim = HasClaim(requiredPermission);
            if (!hasClaim)
                throw new PermissionException($"Not authorised to perform action: {requiredPermission}",
                    requiredPermission);
        }

        public static void DemandPermission(string[] requiredPermission)
        {
            var hasClaim = HasClaim(requiredPermission);
            if (!hasClaim)
                throw new PermissionException($"Not authorised to perform action: {requiredPermission}",
                    String.Join(",", requiredPermission.ToArray()));
        }

        public static bool IsUserAuthorised(string requiredPermission, bool throwOnError)
        {
            var hasClaim = HasClaim(requiredPermission);
            if (!hasClaim && throwOnError)
                throw new PermissionException($"Not authorised to perform action: {requiredPermission}",
                    requiredPermission);
            return hasClaim;
        }
    }
}