using Newtonsoft.Json.Serialization;

using System.Text.RegularExpressions;

namespace RMA.Common.Extensions
{
    public class SnakeCasePropertyNamesContractResolver : DefaultContractResolver
    {
        protected override string ResolvePropertyName(string propertyName)
        {
            var startUnderscores = Regex.Match(propertyName, @"^_+");
            return startUnderscores + Regex
                       .Replace(propertyName, @"([A-Z0-9])", "_$1").ToLower().TrimStart('_');
        }
    }
}