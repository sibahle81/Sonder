namespace RMA.Common.Interfaces
{
    public interface ISerializerService
    {
        string Serialize<T>(T obj);
        T Deserialize<T>(string json);
        T DeserializeIgnore<T>(string json);
        T DeserializeWithErrorLogging<T>(string json);
    }
}