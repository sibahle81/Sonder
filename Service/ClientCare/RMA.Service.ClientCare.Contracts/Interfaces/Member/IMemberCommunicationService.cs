using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Member;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Member
{
    public interface IMemberCommunicationService : IService
    {
        Task<int> SendMemberLogsEmail(LetterOfGoodStanding letterOfGoodStanding, int declarationYear, int productOptionId, bool uploadDocument);
    }
}

