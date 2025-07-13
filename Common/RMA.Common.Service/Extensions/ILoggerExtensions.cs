using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.ServiceFabric.Actors;
using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Service.ServiceFabric.Constants;

using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace RMA.Common.Service.Extensions
{
    public static class ILoggerExtensions
    {
        public static void LogMetric(this ILogger logger, string name, double value, double? max = null,
            double? min = null)
        {
            logger.LogInformation(ServiceFabricEvent.Metric,
                $"Metric {{{MetricProperties.Name}}}, value: {{{MetricProperties.Value}}}, min: {{{MetricProperties.MinValue}}}, max: {{{MetricProperties.MaxValue}}}",
                name,
                value,
                min,
                max);
        }

        public static void LogDependency<TService, TResult>(this ILogger logger,
            Expression<Func<TService, Task<TResult>>> callMethod, DateTime started, TimeSpan duration, bool success)
            where TService : IService
        {
            logger.LogInformation(ServiceFabricEvent.ServiceRequest,
                $"The call to {{{DependencyProperties.Type}}} dependency {{{DependencyProperties.DependencyTypeName}}} named {{{DependencyProperties.Name}}} finished in {{{DependencyProperties.DurationInMs}}} ms (success: {{{DependencyProperties.Success}}}) ({{{DependencyProperties.StartTime}}})",
                "ServiceFabric",
                typeof(TService).FullName,
                ((MethodCallExpression)callMethod?.Body).Method.ToString(),
                duration.TotalMilliseconds,
                success,
                started);
        }

        public static void LogDependency<TService>(this ILogger logger, Expression<Func<TService, Task>> callMethod,
            DateTime started, TimeSpan duration, bool success) where TService : IService
        {
            logger.LogInformation(ServiceFabricEvent.ServiceRequest,
                $"The call to {{{DependencyProperties.Type}}} dependency {{{DependencyProperties.DependencyTypeName}}} named {{{DependencyProperties.Name}}} finished in {{{DependencyProperties.DurationInMs}}} ms (success: {{{DependencyProperties.Success}}}) ({{{DependencyProperties.StartTime}}})",
                "ServiceFabric",
                typeof(TService).FullName,
                ((MethodCallExpression)callMethod?.Body).Method.ToString(),
                duration.TotalMilliseconds,
                success,
                started);
        }

        public static void LogDependency(this ILogger logger, string service, string method,
            DateTime started, TimeSpan duration, bool success)
        {
            logger.LogInformation(ServiceFabricEvent.ServiceRequest,
                $"The call to {{{DependencyProperties.Type}}} dependency {{{DependencyProperties.DependencyTypeName}}} named {{{DependencyProperties.Name}}} finished in {{{DependencyProperties.DurationInMs}}} ms (success: {{{DependencyProperties.Success}}}) ({{{DependencyProperties.StartTime}}})",
                "ServiceFabric",
                service,
                method,
                duration.TotalMilliseconds,
                success,
                started);
        }

        public static void LogDependency(this ILogger logger, string service, string method,
            DateTime started, TimeSpan duration, bool success, ActorId actorId)
        {
            logger.LogInformation(ServiceFabricEvent.ServiceRequest,
                $"The call to {{{DependencyProperties.Type}}} actor {{{DependencyProperties.DependencyTypeName}}} with id {{{nameof(ActorId)}}} named {{{DependencyProperties.Name}}} finished in {{{DependencyProperties.DurationInMs}}} ms (success: {{{DependencyProperties.Success}}}) ({{{DependencyProperties.StartTime}}})",
                "ServiceFabric",
                service,
                actorId?.ToString(),
                method,
                duration.TotalMilliseconds,
                success,
                started);
        }

        public static void LogRequest(this ILogger logger, HttpContext context, DateTime started, TimeSpan duration,
            bool success)
        {
            var request = context?.Request;
            logger.LogInformation(ServiceFabricEvent.ApiRequest,
                $"The {{{ApiRequestProperties.Method}}} action to {{{ApiRequestProperties.Scheme}}}{{{ApiRequestProperties.Host}}}{{{ApiRequestProperties.Path}}} finished in {{{ApiRequestProperties.DurationInMs}}} ms with status code {{{ApiRequestProperties.StatusCode}}}({{{ApiRequestProperties.Success}}}) Headers: {{{ApiRequestProperties.Headers}}} Body: {{{ApiRequestProperties.Body}}} ({{{ApiRequestProperties.Response}}}) ({{{ApiRequestProperties.StartTime}}})",
                request.Method,
                request.Scheme,
                request.Host.Value,
                request.Path.Value,
                duration.TotalMilliseconds,
                context.Response.StatusCode,
                success,
                request.ReadHeadersAsString(),
                request.ReadRequestBodyAsString(),
                context.Response,
                started);
        }
    }
}