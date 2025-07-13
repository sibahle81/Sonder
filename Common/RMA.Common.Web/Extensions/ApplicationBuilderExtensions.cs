using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;

using RMA.Common.Service.Middleware;
using RMA.Common.Web.ExceptionHandling;

namespace RMA.Common.Web.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseApiDocumentation(this IApplicationBuilder app)
        {
            app.UseSwagger(c => c.RouteTemplate = "api-docs/{documentName}/swagger.json");
            return app;
        }

        public static IApplicationBuilder UseApiErrorHandling(this IApplicationBuilder app)
        {
            app.UseMiddleware<ErrorHandlingMiddleware>();
            return app;
        }

        public static IApplicationBuilder UseResourceServerConfiguration(this IApplicationBuilder app)
        {
            app.UseRmaCors();
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });
            app.UseRmaHttpHeaders();
            /**
              app.Use(async (context, next) =>
            {
                context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                await next();
            });
            **/
            app.UseApiErrorHandling();
            app.UseRequestTracking();
            app.UseMvc();
            app.UseApiDocumentation();
            return app;
        }

        public static IApplicationBuilder UseRmaCors(this IApplicationBuilder app)
        {
            app.UseCors("AllowAll");
            return app;
        }

        public static IApplicationBuilder UseRmaHttpHeaders(this IApplicationBuilder app)
        {
            app.Use((context, next) =>
            {
                /** context.Response.Headers.Add("Access-Control-Allow-Origin", *); **/
                context.Response.Headers.Add("Server", string.Empty);
                return next();
            });
            return app;
        }
    }
}