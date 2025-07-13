using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IQuickTransactionVopdService : IService
    {
        Task<QuickVopdResponseMessage> SubmitVOPDRequest(VopdRequestMessage vopdRequestMessage);
    }
}
