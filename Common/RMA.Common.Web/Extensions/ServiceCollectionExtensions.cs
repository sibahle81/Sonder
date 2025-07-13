using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Cors.Internal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Common.Web.OpenId;

using Swashbuckle.AspNetCore.Swagger;

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace RMA.Common.Web.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApiDocumentation(this IServiceCollection services, string applicationName,
            string version = "v1")
        {
            var authority = Environment.GetEnvironmentVariable("OpenId.Authority");
            var clientId = Environment.GetEnvironmentVariable("OpenId.RmaApiClientId");

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc(version, new Info { Title = applicationName, Version = version });
                c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());

                // Define the OAuth2.0 scheme that's in use (i.e. Implicit Flow) 
                c.AddSecurityDefinition("oauth2", new OAuth2Scheme
                {
                    Type = "oauth2",
                    Flow = "implicit",
                    AuthorizationUrl = $"{authority}/connect/authorize",
                    Scopes = new Dictionary<string, string>
                    {
                        {clientId, $"Access to {applicationName}"}
                    }
                });

                /** {e.HttpMethod}_**/
                c.CustomOperationIds(e => $"{e.ActionDescriptor.RouteValues["controller"]}_{e.ActionDescriptor.RouteValues["action"]}");
                // Assign scope requirements to operations based on AuthorizeAttribute 
                c.OperationFilter<SecurityRequirementsOperationFilter>();
                c.AddSecurityRequirement(new Dictionary<string, IEnumerable<string>>
                {
                    {"oauth2", new[] {clientId}}
                });
                // use fully qualified object names
                c.CustomSchemaIds(x => x.FullName);
                /**c.IncludeXmlComments(System.IO.Path.Combine(System.AppContext.BaseDirectory, "Documentation.xml"));**/
            });

            return services;
        }

        public static IServiceCollection AddRmaCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.DefaultPolicyName = "AllowAll";
                options.AddPolicy("AllowAll", policyBuilder =>
                {
                    policyBuilder
                        .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            services.Configure<MvcOptions>(options => options.Filters.Add(new CorsAuthorizationFilterFactory("AllowAll")));
            return services;
        }

        public static IServiceCollection AddResourceServer(this IServiceCollection services)
        {
            var authority = Environment.GetEnvironmentVariable("OpenId.Authority");
            var clientId = Environment.GetEnvironmentVariable("OpenId.RmaApiClientId");
            var clientSecret = Environment.GetEnvironmentVariable("OpenId.RmaApiClientSecret");

            services.AddRmaCors();
            services.Configure<CookiePolicyOptions>(options => options.MinimumSameSitePolicy = SameSiteMode.None);

            services
                .AddAuthentication(options => options.DefaultScheme = "ClientCookie")
                .AddCookie("ClientCookie", options =>
                {
                    options.Cookie.Name = CookieAuthenticationDefaults.CookiePrefix + "ClientCookie";
                    options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
                    options.LoginPath = new PathString("/signin");
                    options.LogoutPath = new PathString("/signout");
                })
                .AddOAuthIntrospection("Bearer", options =>
                {
                    options.Authority = new Uri(authority);
                    options.Audiences.Add(clientId);
                    options.ClientId = clientId;
                    options.ClientSecret = clientSecret;
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.NameClaimType = "name";
                    options.RoleClaimType = "role";

                    options.Events.OnCreateTicket = async context =>
                    {
                        // Invoked when a ticket is to be created from an introspection response. 
                        var bearerToken = context.Properties.GetTokenValue("access_token");

                        context.Identity.AddClaim(new Claim(
                            "access_token",
                            bearerToken)
                        );

                        if (context.Request.Path.ToString().Contains("/api/user/info"))
                            return;

                        using (var httpClient = new HttpClient())
                        {
                            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
                            var response = await httpClient.GetAsync($"{authority.Replace("/auth", "")}/sec/api/user/info");

                            if (response.IsSuccessStatusCode)
                            {
                                string responseString = await response.Content.ReadAsStringAsync();

                                try
                                {
                                    dynamic data = JObject.Parse(responseString);

                                    foreach (var permission in data.permissions)
                                    {
                                        context.Identity.AddClaim(new Claim("permission", permission.Value));
                                    }

                                    context.Identity.AddClaim(new Claim("tenantId", JObject.Parse(responseString)["tenantId"].ToString()));
                                }
                                catch (Exception e)
                                {
                                    e.LogException();
                                }
                            }
                        }
                    };

                    /**
                    options.Events.OnValidateToken = context =>
                    {
                        return Task.CompletedTask;
                    }; 
                    **/
                })
                .AddOpenIdConnect("OpenIdConnect", options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveTokens = true;
                    options.GetClaimsFromUserInfoEndpoint = true;

                    // Note: these settings must match the application details
                    // inserted in the database at the server level.
                    options.ClientId = clientId;
                    options.ClientSecret = clientSecret;

                    // Use the authorization code flow.
                    options.ResponseType = OpenIdConnectResponseType.Code;

                    // Note: setting the Authority allows the OIDC client middleware to automatically
                    // retrieve the identity provider's configuration and spare you from setting
                    // the different endpoints URIs or the token validation parameters explicitly.
                    options.Authority = authority;

                    options.SecurityTokenValidator = new JwtSecurityTokenHandler
                    {
                        // Disable the built-in JWT claims mapping feature.
                        InboundClaimTypeMap = new Dictionary<string, string>()
                    };

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = "name",
                        RoleClaimType = "role"
                    };

                    options.Events.OnTokenResponseReceived = context => Task.CompletedTask;
                });

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<IPrincipal>(provider =>
            {
                var user = provider.GetService<IHttpContextAccessor>().HttpContext.User;
                return user;
            });

            services
                .AddMvc(o =>
                {
                    var policy = new AuthorizationPolicyBuilder("Bearer")
                        .RequireAuthenticatedUser()
                        .Build();

                    o.Filters.Add(new CustomAuthorizeFilter(policy));
                })
                .AddJsonOptions(options => options.SerializerSettings.Formatting = Formatting.Indented)
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            return services;
        }
    }
}