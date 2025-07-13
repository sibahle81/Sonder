using Microsoft.AspNetCore.Authorization;

using RMA.Common.Web.ExceptionHandling;

using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Common.Web.OpenId
{
    public class SecurityRequirementsOperationFilter : IOperationFilter
    {
        public void Apply(Operation operation, OperationFilterContext context)
        {
            if (operation == null) throw new ArgumentNullException(nameof(operation), "operation is null");
            if (context == null) throw new ArgumentNullException(nameof(context), "context is null");
            // Policy names map to scopes
            var requiredScopes = context.MethodInfo
                .GetCustomAttributes(true)
                .OfType<AuthorizeAttribute>()
                .Select(attr => attr.Policy)
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct().ToList();

            var parentScopes = context.MethodInfo.DeclaringType?
                .GetCustomAttributes(true)
                .OfType<AuthorizeAttribute>()
                .Select(attr => attr.Policy)
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct().ToList();

            if (parentScopes?.Any() == true)
                requiredScopes.AddRange(parentScopes);



            if (requiredScopes.Count > 0)
            {
                operation.Security = new List<IDictionary<string, IEnumerable<string>>>
                {
                    new Dictionary<string, IEnumerable<string>> {{"oauth2", requiredScopes}}
                };
            }

            var errorSchema = context.SchemaRegistry.GetOrRegister(typeof(ErrorMessage));
            operation.Responses.Add("400", new Response { Description = "Bad Request", Schema = errorSchema });
            operation.Responses.Add("401", new Response { Description = "Unauthorized", Schema = errorSchema });

            operation.Responses.Add("500", new Response { Description = "Forbidden", Schema = errorSchema });

            if (operation.Parameters.Count > 0 && operation.OperationId.EndsWith("Get",StringComparison.CurrentCultureIgnoreCase))
            {
                operation.OperationId += "By";
                foreach (var parm in operation.Parameters) operation.OperationId += $"{parm.Name}";
            }
        }
    }
}