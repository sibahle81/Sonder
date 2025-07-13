using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;

namespace RMA.Common.Service.Services
{
    public class SerializerFacade : ISerializerService
    {
        public string Serialize<T>(T obj)
        {
            var contractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            };
            var result = JsonConvert.SerializeObject(obj, new JsonSerializerSettings
            {
                ContractResolver = contractResolver,
                Formatting = Formatting.None
            });
            return result;
        }

        public T Deserialize<T>(string json)
        {
            var result = JsonConvert.DeserializeObject<T>(json);
            return result;
        }

        public T DeserializeIgnore<T>(string json)
        {
            var result = JsonConvert.DeserializeObject<T>(json, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            });
            return result;
        }

        public T DeserializeWithErrorLogging<T>(string json)
        {
            var result = JsonConvert.DeserializeObject<T>(json, new JsonSerializerSettings
            {
                Error = (sender, args) =>
                {
                    args.ErrorContext.Error.LogException($"Deserialization error at '{args.ErrorContext.Path}': {args.ErrorContext.Error.Message}");
                    args.ErrorContext.Handled = true; // Continue despite error
                }
            });
            return result;
        }
    }
}