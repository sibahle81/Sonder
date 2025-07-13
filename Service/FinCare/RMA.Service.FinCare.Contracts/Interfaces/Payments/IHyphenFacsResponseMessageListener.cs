using RMA.Service.FinCare.Contracts.Integration.Hyphen;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IHyphenFacsResponseMessageListener
    {
        Task ReceiveMessageAsync(RootHyphenFACSResponse message, CancellationToken cancellationToken);
    }
}