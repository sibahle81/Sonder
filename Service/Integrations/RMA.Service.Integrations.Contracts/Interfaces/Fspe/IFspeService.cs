using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Fspe
{
    public interface IFspeService : IService
    {
        Task<List<Fsp>> GetFspDetails(List<string> fspNumbers);
        Task<List<object>> GetDebarredInfo(List<string> idNumbers);
        Task SetSubscriptionList(string reference, List<string> fspNumbers);
    }
}
