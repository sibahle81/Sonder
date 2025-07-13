using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Threading.Tasks;

namespace RMA.Common.Interfaces
{
    public interface IMessageTypeTaskHandler : IService
    {
        Task ExecuteTask(MessageType messageType);
    }
}
