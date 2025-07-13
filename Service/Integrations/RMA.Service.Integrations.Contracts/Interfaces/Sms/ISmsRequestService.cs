using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.Sms
{
    public interface ISmsRequestService : IService
    {
        Task<List<SendSmsRequestResult>> SendSmsMessage(SendSmsRequest request);
    }
}
