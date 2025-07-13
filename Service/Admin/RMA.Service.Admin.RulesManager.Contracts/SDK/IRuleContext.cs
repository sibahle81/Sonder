namespace RMA.Service.Admin.RulesManager.Contracts.SDK
{
    public interface IRuleContext
    {
        string Data { get; set; }
        string ConfigurableData { get; set; }
        T Deserialize<T>(string json);
        string Serialize<T>(T obj);
    }
}