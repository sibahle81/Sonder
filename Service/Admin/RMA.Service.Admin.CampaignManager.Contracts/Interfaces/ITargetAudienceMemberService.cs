using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ITargetAudienceMemberService : IService
    {
        Task<List<TargetAudienceMember>> GetAudienceMembers(int campaignId);
        Task<int> SaveTargetAudienceMembers(List<TargetAudienceMember> members);
    }
}
