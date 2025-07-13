using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Member;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Member
{
    public interface IMemberLogsService : IService
    {
        Task<MemberLogs> GetMemberLogsById(int id);
        Task<bool> CreateMemberLogs(MemberLogs memberLogs);
        Task<List<MemberLogs>> GetMemberLogsByRolePlayerId(int rolePayerId);
    }
}
