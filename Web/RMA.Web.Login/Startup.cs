using Autofac;
using Autofac.Extensions.DependencyInjection;

using CommonServiceLocator;

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using RMA.Common.Service;
using RMA.Common.Service.Diagnostics.Serilog;
using RMA.Common.Service.ServiceLocation;
using RMA.Common.Web.Extensions;
using RMA.Web.Login.Models;
using RMA.Web.Login.Providers;

using Serilog;

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Principal;
using System.Text;

namespace RMA.Web.Login
{
    public class Startup
    {
        public IConfigurationRoot Configuration { get; }
        public IContainer ApplicationContainer { get; private set; }

        public Startup(IHostingEnvironment env)
        {
            if(env == null) throw new ArgumentNullException(nameof(env));
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            this.Configuration = builder.Build();
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationContext>(options =>
            {
                var connection = Environment.GetEnvironmentVariable("DB");
                options.UseSqlServer(connection);
            });

            services.AddAuthentication(options => options.DefaultScheme = "ServerCookie")
            .AddCookie("ServerCookie", options =>
            {
                options.Cookie.Name = CookieAuthenticationDefaults.CookiePrefix + "ServerCookie";
                options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
                options.LoginPath = new PathString("/signin");
                options.LogoutPath = new PathString("/signout");
            })
            .AddOAuthValidation("Bearer", options =>
            {
                options.IncludeErrorDetails = true;
                options.SaveToken = true;
            })

            .AddOpenIdConnectServer(options =>
            {
                var authority = Environment.GetEnvironmentVariable("OpenId.Authority");
                var privateKey = Environment.GetEnvironmentVariable("AuthSigningKey");

                options.ProviderType = typeof(AuthorizationProvider);

                // Enable the authorization, logout, token and userinfo endpoints.
                options.AuthorizationEndpointPath = "/connect/authorize";
                options.LogoutEndpointPath = "/connect/logout";
                options.TokenEndpointPath = "/connect/token";
                options.UserinfoEndpointPath = "/connect/userinfo";
                options.IntrospectionEndpointPath = "/connect/introspect";
                options.AccessTokenLifetime = TimeSpan.FromDays(14);


                // Note: see AuthorizationController.cs for more
                // information concerning ApplicationCanDisplayErrors.
                options.ApplicationCanDisplayErrors = true;

                // During development, you can set AllowInsecureHttp
                // to true to disable the HTTPS requirement.
                options.AllowInsecureHttp = true;
                options.Issuer = new Uri(authority ?? throw new InvalidOperationException());

                // Note: to override the default access token format and use JWT, assign AccessTokenHandler:

                options.AccessTokenHandler = new JwtSecurityTokenHandler
                {
                    InboundClaimTypeMap = new Dictionary<string, string>(),
                    OutboundClaimTypeMap = new Dictionary<string, string>(),
                };

                var securityKey = new SymmetricSecurityKey(Encoding.Default.GetBytes(privateKey));
                var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
                options.SigningCredentials.Add(signingCredentials);
            });

            services.AddRmaCors();
            services.AddScoped<AuthorizationProvider>();
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.AddDistributedMemoryCache();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<IPrincipal>(provider => provider.GetService<IHttpContextAccessor>().HttpContext.User);

            services.AddLogging(loggingBuilder => loggingBuilder.AddDebug().AddConsole());
            services.AddSingleton<ILoggerFactory>(provider => new SerilogLoggerFactory(Log.Logger,dispose:true));

            //.AddSingleton<ILoggerFactory>(new SerilogLoggerFactory(Log.Logger))
            // Create the container builder.
            var builder = ContainerConfiguration.Configure();
            builder.RegisterModule<CommonServiceServiceRegistry>();
            builder.Populate(services);
            ApplicationContainer = builder.Build();
            var csl = new AutofacServiceLocator(ApplicationContainer);
            ServiceLocator.SetLocatorProvider(() => csl);

            // Create the IServiceProvider based on the container.
            return new AutofacServiceProvider(this.ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseRmaCors();
            app.UseRmaHttpHeaders();
            /*
            app.Use(async (context, next) =>
            {
                context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                await next();
            });
            */
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
            if (app == null) throw new ArgumentNullException(nameof(app));
            using (var database = app.ApplicationServices.GetService<ApplicationContext>())
            {
               // Note: when using the introspection middleware, your resource server
                // MUST be registered as an OAuth2 client and have valid credentials.


                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.AngularClient"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.AngularClient",
                        DisplayName = "RmaSF.AngularClient",
                        RedirectUri = "http://localhost/signin-oidc",
                        LogoutRedirectUri = "http://localhost/signout-callback-oidc",
                        Secret = "m7b7ukerk7l7kvm99jeqncloyez3gvviuqfg6ezon716m",
                        ApplicationType = ApplicationType.Public,
                        IntrospectionAllowed = false
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.SecurityApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.SecurityApi",
                        DisplayName = "RmaSF.SecurityApi",
                        RedirectUri = "http://localhost/sec/signin-oidc",
                        LogoutRedirectUri = "http://localhost/sec/signout-callback-oidc",
                        Secret = "go2hd07pavsgbm15393ujjux37e8xbxvclq2elxo6lt0k",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.MasterDataApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.MasterDataApi",
                        DisplayName = "RmaSF.MasterDataApi",
                        RedirectUri = "http://localhost/mdm/signin-oidc",
                        LogoutRedirectUri = "http://localhost/mdm/signout-callback-oidc",
                        Secret = "miutwahfw9ddjtbkyxo1251s9mcuh56ga29qym6bztbxr",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.CampaignManagerApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.CampaignManagerApi",
                        DisplayName = "RmaSF.CampaignManagerApi",
                        RedirectUri = "http://localhost/cmp/signin-oidc",
                        LogoutRedirectUri = "http://localhost/cmp/signout-callback-oidc",
                        Secret = "koxfglfdpq0b2m0bribfhk7isf8e4l599hui41p3dsbe1",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.BusinessProcessManagerApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.BusinessProcessManagerApi",
                        DisplayName = "RmaSF.BusinessProcessManagerApi",
                        RedirectUri = "http://localhost/bpm/signin-oidc",
                        LogoutRedirectUri = "http://localhost/bpm/signout-callback-oidc",
                        Secret = "0qzbcs9eckryhywc6kqh11yqksupwy07l1jjhxhku4qct",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.ClaimCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.ClaimCareApi",
                        DisplayName = "RmaSF.ClaimCareApi",
                        RedirectUri = "http://localhost/clm/signin-oidc",
                        LogoutRedirectUri = "http://localhost/clm/signout-callback-oidc",
                        Secret = "y6yodmzpb42c98rmvggcfa97yh0fto29x7t0wilfoidqo",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.ClientCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.ClientCareApi",
                        DisplayName = "RmaSF.ClientCareApi",
                        RedirectUri = "http://localhost/clc/signin-oidc",
                        LogoutRedirectUri = "http://localhost/clc/signout-callback-oidc",
                        Secret = "wrtaazuxa1qcexu95mvzd4fzcr8b65cugkxknksg3cghg",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }
                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.IntegrationsApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.IntegrationsApi",
                        DisplayName = "RmaSF.IntegrationsApi",
                        RedirectUri = "http://localhost/int/signin-oidc",
                        LogoutRedirectUri = "http://localhost/int/signout-callback-oidc",
                        Secret = "wrtaazuxa1qcexu95mvzd4fzcr8b65cugkxknksg3cghg",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.MediCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.MediCareApi",
                        DisplayName = "RmaSF.MediCareApi",
                        RedirectUri = "http://localhost/med/signin-oidc",
                        LogoutRedirectUri = "http://localhost/med/signout-callback-oidc",
                        Secret = "5lx3f41pyb4fja5zuufy93purq95rookvm008e4cv778w",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.FinCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.FinCareApi",
                        DisplayName = "RmaSF.FinCareApi",
                        RedirectUri = "http://localhost/fin/signin-oidc",
                        LogoutRedirectUri = "http://localhost/fin/signout-callback-oidc",
                        Secret = "z0nj8s27k3rkz83jx3n30ajnkp5rw2sw8plrwcz23vtbe",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.PensCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.PensCareApi",
                        DisplayName = "RmaSF.PensCareApi",
                        RedirectUri = "http://localhost/pen/signin-oidc",
                        LogoutRedirectUri = "http://localhost/pen/signout-callback-oidc",
                        Secret = "cas4td3b2mwt0bonfv97r8ycfbx1kv7xmt3pa50tgrvg1",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.ScanCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.ScanCareApi",
                        DisplayName = "RmaSF.ScanCareApi",
                        RedirectUri = "http://localhost/scn/signin-oidc",
                        LogoutRedirectUri = "http://localhost/scn/signout-callback-oidc",
                        Secret = "515914sbwn17l5k1ktrw4hxg5na5z7g1ueobtk4ylvq36",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.RulesManagerApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.RulesManagerApi",
                        DisplayName = "RmaSF.RulesManagerApi",
                        RedirectUri = "http://localhost/rul/signin-oidc",
                        LogoutRedirectUri = "http://localhost/rul/signout-callback-oidc",
                        Secret = "5v6ku2eq57wxbvblok58sw9za9trngaz2mp2etyp7kdol",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.ApiDocs"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.ApiDocs",
                        DisplayName = "RmaSF.ApiDocs",
                        RedirectUri = "http://localhost/api-docs/signin-oidc",
                        LogoutRedirectUri = "http://localhost/api-docs/signout-callback-oidc",
                        Secret = "5v6ku2eq57wxbvblok58sw9za9trngaz2mp2etyp7kdol",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.SwaggerApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.SwaggerApi",
                        DisplayName = "RmaSF.SwaggerApi",
                        RedirectUri = "http://localhost/api-docs/swagger/oauth2-redirect.html",
                        LogoutRedirectUri = "http://localhost/api-docs/signout-callback-oidc",
                        Secret = "5v6ku2eq57wxbvblok58sw9za9trngaz2mp2etyp7kdol",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.AuditApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.AuditApi",
                        DisplayName = "RmaSF.AuditApi",
                        RedirectUri = "http://localhost/audit/signin-oidc",
                        LogoutRedirectUri = "http://localhost/audit/signout-callback-oidc",
                        Secret = "9uy6tfvb75edchui9wazxdvlo04wqdfctigrscoh7e3w5",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.BillingApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.BillingApi",
                        DisplayName = "RmaSF.BillingApi",
                        RedirectUri = "http://localhost/bill/signin-oidc",
                        LogoutRedirectUri = "http://localhost/bill/signout-callback-oidc",
                        Secret = "e8y6tcqnq5ie2jb0i6g4lxdvhb0joq2s56po8lhohq9pf",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.DigiCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.DigiCareApi",
                        DisplayName = "RmaSF.DigiCareApi",
                        RedirectUri = "http://localhost/digi/signin",
                        LogoutRedirectUri = "http://localhost/digi/signout-callback",
                        Secret = "edaf83a3bf445e58e802f4f2802eccc4ebf184ca",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.MemberPortalClient"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.MemberPortalClient",
                        DisplayName = "RmaSF.MemberPortalClient",
                        RedirectUri = "http://localhost/signin",
                        LogoutRedirectUri = "http://localhost:4200/signout-callback",
                        Secret = "49b3407aaddb40db1cf59b1b4586bc2bd3edce683e4ef",
                        ApplicationType = ApplicationType.Public,
                        IntrospectionAllowed = false
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.MSPPortalClient"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.MSPPortalClient",
                        DisplayName = "RmaSF.MSPPortalClient",
                        RedirectUri = "http://localhost/signin",
                        LogoutRedirectUri = "http://localhost/signout-callback",
                        Secret = "bda7bccd71805346bac30e98266e3e2e136dc2c8c0cffbe",
                        ApplicationType = ApplicationType.Public,
                        IntrospectionAllowed = false
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.MemberPortalApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.MemberPortalApi",
                        DisplayName = "RmaSF.MemberPortalApi",
                        RedirectUri = "http://localhost/member/signin",
                        LogoutRedirectUri = "http://localhost/member/signout-callback",
                        Secret = "aersdeg3bf445e58e802f4f2802eccc4ebf184ca",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.CompCareMapperApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.CompCareMapperApi",
                        DisplayName = "RmaSF.CompCareMapperApi",
                        RedirectUri = "http://localhost/ccm/signin-oidc",
                        LogoutRedirectUri = "http://localhost/ccm/signout-callback-oidc",
                        Secret = "ebuig457fsnsudfygi89789uyiuzsdfiu908785ugyfig",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.LegalCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.LegalCareApi",
                        DisplayName = "RmaSF.LegalCareApi",
                        RedirectUri = "http://localhost/legal/signin-oidc",
                        LogoutRedirectUri = "http://localhost/legal/signout-callback-oidc",
                        Secret = "3fe5f16b-aeeb-4087-adcd-83efbea35f23",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.DebtCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.DebtCareApi",
                        DisplayName = "RmaSF.DebtCareApi",
                        RedirectUri = "http://localhost/debt/signin-oidc",
                        LogoutRedirectUri = "http://localhost/debt/signout-callback-oidc",
                        Secret = "3fe5f16b-aeeb-4087-adcd-83efbea35f23",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                if (!database.Applications.Any(d => d.ApplicationID == "RmaSF.MarketingCareApi"))
                {
                    database.Applications.Add(new Application
                    {
                        ApplicationID = "RmaSF.MarketingCareApi",
                        DisplayName = "RmaSF.MarketingCareApi",
                        RedirectUri = "http://localhost/mrk/signin-oidc",
                        LogoutRedirectUri = "http://localhost/mrk/signout-callback-oidc",
                        Secret = "3fe5f16b-aeeb-4087-adcd-83efbea35f23",
                        ApplicationType = ApplicationType.Private,
                        IntrospectionAllowed = true
                    });
                }

                database.SaveChanges();
            }
        }
    }
}
