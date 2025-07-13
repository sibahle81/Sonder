using RMA.Service.Integrations.Contracts.Entities.Hyphen;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Hyphen
{
    public interface IHyphenAccountVerificationResponseListener
    {
        Task ReceiveMessageAsync(RootHyphenVerificationBankResponse message, CancellationToken cancellationToken);
    }
}