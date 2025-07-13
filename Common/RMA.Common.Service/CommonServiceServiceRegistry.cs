using Autofac;

using AutofacSerilogIntegration;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using RMA.Common.Interfaces;
using RMA.Common.Service.Audit;
using RMA.Common.Service.Diagnostics.Serilog;
using RMA.Common.Service.Services;

using Serilog;

using ServiceFabric.Remoting.CustomHeaders;

using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;

namespace RMA.Common.Service
{
    public class CommonServiceServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.Register(c =>
            {
                if (RemotingContext.Keys.Count() > 1)
                {
                    var claims = new List<Claim>();
                    foreach (var item in RemotingContext.Keys.Where(k => k.Contains('_')))
                    {
                        var data = RemotingContext.GetData(item);
                        var key = item.Substring(item.IndexOf('_') + 1);

                        if (data != null)
                            claims.Add(new Claim(key, data.ToString()));
                    }

                    var identity = new ClaimsIdentity(claims, "RemotingContext");
                    var principal = new ClaimsPrincipal(identity);
                    return principal;
                }
                else if (c.IsRegistered<IHttpContextAccessor>())
                {
                    return c.Resolve<IHttpContextAccessor>().HttpContext.User;
                }
                else
                {
                    //Service Bus
                    var claims = new List<Claim> { new Claim("permission", "SuperMagicSecretClaim") };
                    //TODO should get access from a designated user
                    var identity = new ClaimsIdentity(claims, "ServiceBusContext");
                    var principal = new ClaimsPrincipal(identity);
                    return principal;
                }
            }).As<IPrincipal>();

            builder.Register(_ => new SerilogLoggerFactory(Log.Logger)).As<ILoggerFactory>().SingleInstance();

            //Serilog - type injector
            builder.RegisterLogger();

            builder.RegisterType<SerializerFacade>().As<ISerializerService>();
            builder.RegisterType<EmailSenderFacade>().As<IEmailSenderService>();
            builder.RegisterType<AuditWriter>().As<IAuditWriter>();
            builder.RegisterType<HttpClientFacade>().As<IHttpClientService>().SingleInstance();
        }
    }
}