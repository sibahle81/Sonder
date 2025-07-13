using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ISmsTokenService : IService
    {
        Task<List<SmsToken>> GetTokens(int smsId);
        Task<int> SaveTokens(List<SmsToken> tokens);
        Task<int> DeleteTokens(int smsId);
    }
}