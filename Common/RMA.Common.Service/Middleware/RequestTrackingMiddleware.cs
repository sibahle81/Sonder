using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.Extensions;
using RMA.Common.Service.ServiceFabric.Constants;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Fabric;
using System.Globalization;
using System.Threading.Tasks;

namespace RMA.Common.Service.Middleware
{
    public class RequestTrackingMiddleware
    {
        private readonly ILoggerFactory _loggerFactory;
        private readonly RequestDelegate _next;

        public RequestTrackingMiddleware(RequestDelegate next, ILoggerFactory loggerFactory)
        {
            _next = next;
            _loggerFactory = loggerFactory;
        }

        public async Task Invoke(HttpContext context, StatelessServiceContext serviceContext)
        {
            var logger = _loggerFactory.CreateLogger(serviceContext?.ServiceTypeName);
            using (logger.BeginScope(new Dictionary<string, object>
            {
                [SharedProperties.TraceId] = context?.Request.HttpContext.TraceIdentifier
            }))
            {
                RemotingContext.SetData(HeaderIdentifiers.TraceId, context.Request.HttpContext.TraceIdentifier);

                AddTracingDetailsOnRequest(context, serviceContext);

                var stopwatch = Stopwatch.StartNew();
                var started = DateTimeHelper.SaNow;
                var success = false;

                try
                {
                    await _next(context);
                    success = true;
                }
                catch (BusinessException businessException)
                {
                    logger.LogInformation(ServiceFabricEvent.Exception, businessException, businessException.Message);
                    throw;
                }
                catch (Exception exception)
                {
                    logger.LogCritical(ServiceFabricEvent.Exception, exception, exception.Message);
                    throw;
                }
                finally
                {
                    stopwatch.Stop();
                    logger.LogRequest(context, started, stopwatch.Elapsed, success);
                }
            }
        }

        private static void AddTracingDetailsOnRequest(HttpContext context, ServiceContext serviceContext)
        {
            if (!context.Request.Headers.ContainsKey("X-Fabric-AddTracingDetails")) return;

            context.Response.Headers.Add("X-Fabric-NodeName", serviceContext.NodeContext.NodeName);
            context.Response.Headers.Add("X-Fabric-InstanceId", serviceContext.ReplicaOrInstanceId.ToString(CultureInfo.InvariantCulture));
            context.Response.Headers.Add("X-Fabric-TraceId", context.Request.HttpContext.TraceIdentifier);
        }
    }
}