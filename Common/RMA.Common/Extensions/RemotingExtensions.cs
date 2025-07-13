using RMA.Common.Entities;

using ServiceFabric.Remoting.CustomHeaders;

using System.Security.Claims;

namespace RMA.Common.Extensions
{
    public static class RemotingExtensions
    {
        public static void SetRemotingContext(this UserInfo userInfo)
        {
            if (userInfo != null)
            {
                var identity = new ClaimsIdentity("RemotingContext");

                // Add all claims for specific user except the token
                identity.AddClaim(new Claim("sub", userInfo.Sub.ToString()));
                identity.AddClaim(new Claim("username", userInfo.Username));
                identity.AddClaim(new Claim("roleId", userInfo.RoleId.ToString()));
                identity.AddClaim(new Claim("authenticationTypeId", userInfo.AuthenticationTypeId.ToString()));
                identity.AddClaim(new Claim("name", userInfo.Name));
                identity.AddClaim(new Claim("role", userInfo.Role ?? "N/A"));
                identity.AddClaim(new Claim("email", userInfo.Email));
                identity.AddClaim(new Claim("tenantId", userInfo.TenantId.ToString()));

                var index = 0;
                foreach (var claim in identity.Claims)
                {
                    RemotingContext.SetData($"{index}_{claim.Type}", claim.Value);
                    index++;
                }

                foreach (var permission in userInfo.Permissions)
                {
                    RemotingContext.SetData($"{index}_permission", permission);
                    index++;
                }
            }
        }
    }
}
