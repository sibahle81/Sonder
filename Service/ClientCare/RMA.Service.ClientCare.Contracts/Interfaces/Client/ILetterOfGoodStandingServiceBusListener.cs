using RMA.Service.ClientCare.Contracts.Entities.Member;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Client
{
    public interface ILetterOfGoodStandingServiceBusListener
    {
        Task ReceiveMessageAsync(LetterOfGoodStandingServiceBusMessage message, CancellationToken cancellationToken);
    }
}