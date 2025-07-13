using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.ExceptionHandling;

namespace RMA.Common.Web.OpenId
{
    public class CustomUnauthorizedResult : JsonResult
    {
        public CustomUnauthorizedResult(string message)
            : base(new ErrorMessage(message))
        {
            StatusCode = StatusCodes.Status401Unauthorized;
        }
    }
}