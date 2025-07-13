using RMA.Common.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;

namespace RMA.Service.Admin.RulesManager.SDK
{
    public class RuleContext : IRuleContext
    {
        private readonly ISerializerService _serializerService;

        public RuleContext(ISerializerService serializerService)
        {
            _serializerService = serializerService;
        }

        public string Data { get; set; }
        public string ConfigurableData { get; set; }

        public string Serialize<T>(T obj)
        {
            return _serializerService.Serialize(obj);
        }

        public T Deserialize<T>(string json)
        {
            return _serializerService.Deserialize<T>(json);
        }
    }
}