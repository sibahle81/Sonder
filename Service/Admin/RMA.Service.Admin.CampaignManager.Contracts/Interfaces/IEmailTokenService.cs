using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface IEmailTokenService : IService
    {
        Task<List<EmailToken>> GetTokens(int emailId);
        Task<int> SaveTokens(List<EmailToken> tokens);
        Task<int> DeleteTokens(int emailId);
    }
}