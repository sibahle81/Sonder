using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IMediSwitchProcessorService : IService
    {
        Task<int> ProcessFile(Switch switchDetail, string fileName, string content);
    }
}

