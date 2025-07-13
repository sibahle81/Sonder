using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ISmsStatusRequestMessageListener : IService
    {
        Task ReceiveMessageAsync(SmsStatusRequestReferenceMessage smsStatusRequestReferenceMessage, CancellationToken cancellationToken);
    }
}
