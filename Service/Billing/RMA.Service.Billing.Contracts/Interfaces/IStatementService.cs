using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IStatementService : IService
    {
        Task SendOutstandingLettersOfGoodStanding();
    }
}
