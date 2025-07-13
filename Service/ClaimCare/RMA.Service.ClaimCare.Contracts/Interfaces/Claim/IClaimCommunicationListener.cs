
using RMA.Service.ClaimCare.Contracts.Entities;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimCommunicationListener
    {
        Task ReceiveMessageAsync(ClaimCommunicationMessage message, CancellationToken cancellationToken);
    }
}

