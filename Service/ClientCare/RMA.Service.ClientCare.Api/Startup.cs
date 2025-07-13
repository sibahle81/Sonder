using Autofac;
using Autofac.Extensions.DependencyInjection;

using CommonServiceLocator;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using RMA.Common.Service.ServiceLocation;
using RMA.Common.Web.Extensions;

using System;

namespace RMA.Service.ClientCare.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public IContainer ApplicationContainer { get; private set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddApiDocumentation("ClientCare");
            services.AddResourceServer();

            // Create the container builder.
            var builder = ContainerConfiguration.Configure(services);
            ApplicationContainer = builder.Build();
            var csl = new AutofacServiceLocator(ApplicationContainer);
            ServiceLocator.SetLocatorProvider(() => csl);

            return new AutofacServiceProvider(ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app)
        {
            app.UseResourceServerConfiguration();
        }
    }
}