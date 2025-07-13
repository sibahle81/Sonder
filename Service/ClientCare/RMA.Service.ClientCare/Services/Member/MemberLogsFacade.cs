using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Member
{
    public class MemberLogsFacade : RemotingStatelessService, IMemberLogsService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<client_LetterOfGoodStanding> _letterOfGoodStandingRepository;
        private readonly ILeadCommunicationService _leadCommunicationService;

        public MemberLogsFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRolePlayerService rolePlayerService,
            IRepository<client_LetterOfGoodStanding> letterOfGoodStandingRepository,
            ILeadCommunicationService leadCommunicationService
            ) : base(context)

        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerService = rolePlayerService;
            _letterOfGoodStandingRepository = letterOfGoodStandingRepository;
            _leadCommunicationService = leadCommunicationService;
        }

        public async Task<MemberLogs> GetMemberLogsById(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _letterOfGoodStandingRepository.Where(s => s.LetterOfGoodStandingId == id).FirstOrDefaultAsync();
                return Mapper.Map<MemberLogs>(result);
            }
        }

        public async Task<bool> CreateMemberLogs(MemberLogs memberLogs)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await GetMemberLogsByRolePlayerId(memberLogs.RolePlayerId);

                await _letterOfGoodStandingRepository.ExecuteSqlCommandAsync(DatabaseConstants.MemberGenerateLOGS,
                new SqlParameter("@rolePlayerId", memberLogs.RolePlayerId),
                new SqlParameter("@UserId", RmaIdentity.UserId));

                var rolePlayer = await _rolePlayerService.GetRolePlayer(memberLogs.RolePlayerId);
                memberLogs.MemberEmail = rolePlayer.EmailAddress;
                await _leadCommunicationService.SendMemberLogsEmail(memberLogs);
                return true;
            }
        }

        public async Task<List<MemberLogs>> GetMemberLogsByRolePlayerId(int rolePlayerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _letterOfGoodStandingRepository.Where(s => s.RolePlayerId == rolePlayerId).ToListAsync();
                var mappedData = Mapper.Map<List<MemberLogs>>(result);

                var rolePlayer = await _rolePlayerService.GetRolePlayer(rolePlayerId);
                foreach (var item in mappedData)
                {
                    item.MemberEmail = rolePlayer.EmailAddress;
                    item.MemberName = rolePlayer.DisplayName;
                }
                return mappedData;
            }
        }

    }
}

