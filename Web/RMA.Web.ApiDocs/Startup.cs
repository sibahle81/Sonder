using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Constants;
using RMA.Common.Web.Extensions;

using System;
using System.Collections.Generic;

namespace RMA.Web.ApiDocs
{
    public class Startup
    {
        public IConfigurationRoot Configuration { get; }

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            this.Configuration = builder.Build();
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddResourceServer();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

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

            app.Use(async (ctx, next) =>
            {
                if (ctx.Request.HttpContext.Request.Path.ToString().Contains("/swagger/"))
                {
                    if (ctx.User?.Identity != null && ctx.User.Identity.IsAuthenticated)
                    {
                        await next();
                    }
                    else
                    {
                        // If you're not authenticated, do not proceed
                        // and issue an authentication challenge
                        await ctx.ChallengeAsync("ClientCookie");
                    }
                }
                else
                {
                    await next();
                }
            });

            app.UseSwaggerUI(c =>
            {
                c.DocumentTitle = "Rand Mutual Assurance Api Documentation";
                c.SwaggerEndpoint($"/{AppPrefix.BusinessProcessManager}/api-docs/v1/swagger.json", "Business Process Manager v1");
                c.SwaggerEndpoint($"/{AppPrefix.CampaignManager}/api-docs/v1/swagger.json", "Campaign Manager v1");
                c.SwaggerEndpoint($"/{AppPrefix.MasterDataManager}/api-docs/v1/swagger.json", "Master Data Manager v1");
                c.SwaggerEndpoint($"/{AppPrefix.RulesManager}/api-docs/v1/swagger.json", "Rules Manager v1");
                c.SwaggerEndpoint($"/{AppPrefix.SecurityManager}/api-docs/v1/swagger.json", "Security Manger v1");
                c.SwaggerEndpoint($"/{AppPrefix.ScheduledTaskManager}/api-docs/v1/swagger.json", "Scheduled Task manager v1");

                c.SwaggerEndpoint($"/{AppPrefix.ClaimCareApi}/api-docs/v1/swagger.json", "ClaimCare v1");
                c.SwaggerEndpoint($"/{AppPrefix.ClientCareApi}/api-docs/v1/swagger.json", "ClientCare v1");
                c.SwaggerEndpoint($"/{AppPrefix.BillingApi}/api-docs/v1/swagger.json", "Billing v1");
                c.SwaggerEndpoint($"/{AppPrefix.FinCareApi}/api-docs/v1/swagger.json", "FinCare v1");
                c.SwaggerEndpoint($"/{AppPrefix.MediCareApi}/api-docs/v1/swagger.json", "MediCare v1");
                c.SwaggerEndpoint($"/{AppPrefix.PensCareApi}/api-docs/v1/swagger.json", "PensCare v1");
                c.SwaggerEndpoint($"/{AppPrefix.ScanCareApi}/api-docs/v1/swagger.json", "ScanCare v1");

                //var clientId = Environment.GetEnvironmentVariable("OpenId.RmaApiClientId");
                //var clientSecret = Environment.GetEnvironmentVariable("OpenId.RmaApiClientSecret");

                const string clientId = "RmaSF.SwaggerApi";
                const string clientSecret = "5v6ku2eq57wxbvblok58sw9za9trngaz2mp2etyp7kdol";

                c.OAuthClientId(clientId);
                c.OAuthClientSecret(clientSecret);
                c.OAuthRealm(clientId);
                c.OAuthAppName(clientId);
                c.OAuthScopeSeparator(" ");
                c.OAuthUseBasicAuthenticationWithAccessCodeGrant();
                c.OAuthAdditionalQueryStringParams(new Dictionary<string, string>() { { "nonce", Guid.NewGuid().ToString() } });
            });
        }
    }
}
