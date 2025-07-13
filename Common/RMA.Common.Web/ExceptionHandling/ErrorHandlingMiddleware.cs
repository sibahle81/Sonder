using Microsoft.AspNetCore.Http;

using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;

using Serilog;

using System;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Common.Web.ExceptionHandling
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate next;

        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task Invoke(HttpContext context /* other dependencies */)
        {
            if (context == null) throw new ArgumentNullException(nameof(context), "context is null");
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;

            var reference = string.Empty;
            var message = "A system error has occurred";
            var description = "A system error has occurred";
            int statusCode;
            var handled = exception.Data.Contains("IsRMAErrorLogged");

            switch (exception)
            {
                case BusinessException businessException:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = businessException.Message;
                    description = "Review Input Data";
                    break;
                case PermissionException permissionException:
                    statusCode = (int)HttpStatusCode.Forbidden;
                    message = permissionException.Message;
                    description = "Review the permission for the Role assigned to user";
                    break;
                case AggregateException aggregateException:
                    {
                        //For Aggregate exceptions get the inner most error
                        statusCode = (int)HttpStatusCode.InternalServerError;

                        foreach (var innerError in aggregateException.Flatten().InnerExceptions)
                        {
                            var info = new ExceptionInfo(innerError);
                            message = info.ExceptionMessage;
                            description = info.FormattedValue;
                            if (!handled)
                                reference = innerError.LogException();
                            statusCode = innerError is PermissionException ? (int)HttpStatusCode.Forbidden : statusCode;
                        }

                        break;
                    }
                case ArgumentException argEx:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = argEx.Message;
                    description = $"Parameter: {argEx.ParamName}";
                    break;
                default:
                    {
                        Log.Error(exception, exception.Message);

                        statusCode = (int)HttpStatusCode.InternalServerError;
                        var info = new ExceptionInfo(exception);
                        message = info.ExceptionMessage;
                        description = info.FormattedValue;

                        if (!handled)
                            reference = exception.LogException();
                        break;
                    }
            }

            response.ContentType = "application/json";
            response.StatusCode = statusCode;
            await response.WriteAsync(JsonConvert.SerializeObject(new ErrorMessage(message, reference, description)));
        }
    }
}