using Microsoft.AspNetCore.Http;

using System.IO;
using System.Text;

namespace RMA.Common.Service.Extensions
{
    public static class HttpRequestExtensions
    {
        public static string ReadRequestBodyAsString(this HttpRequest request)
        {
            var requestBodyAsText = "";

            if (!HttpMethods.IsGet(request?.Method)
                && !HttpMethods.IsHead(request?.Method)
                && !HttpMethods.IsDelete(request?.Method)
                && !HttpMethods.IsTrace(request?.Method)
                && request.ContentLength > 0)
            {
                using (var reader = new StreamReader(request?.Body))
                {
                    requestBodyAsText = reader.ReadToEnd();
                }
            }

            return requestBodyAsText;
        }

        public static string ReadHeadersAsString(this HttpRequest request)
        {
            var headers = new StringBuilder();
            foreach (var key in request?.Headers.Keys)
            {
                string value = request?.Headers[key];
                if (!string.IsNullOrEmpty(value)) headers.AppendLine($"{key}={value}");
            }

            return headers.ToString();
        }
    }
}