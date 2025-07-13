using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class FollowUpFacade : RemotingStatelessService, IFollowUpService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_FollowUp> _followUpRepository;
        private readonly IMapper _mapper;

        public FollowUpFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_FollowUp> followUpRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _followUpRepository = followUpRepository;
            _mapper = mapper;
        }

        public async Task<List<FollowUp>> GetFollowUps()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var followUps = await _followUpRepository
                    .Where(r => r.AlertDate <= DateTimeHelper.SaNow && !r.AlertSent)
                    .ProjectTo<FollowUp>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return followUps;
            }
        }

        public async Task<List<FollowUp>> GetActiveFollowUps(string username)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var followUps = await _followUpRepository
                    .Where(followUp => !followUp.IsDeleted
                                       && followUp.Email == username)
                    .ProjectTo<FollowUp>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return followUps;
            }
        }

        public async Task<FollowUp> GetFollowUp(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var followup = await _followUpRepository
                    .Where(s => s.Id == id)
                    .ProjectTo<FollowUp>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Could not find follow up with id {id}");

                return followup;
            }
        }

        public async Task<int> AddFollowUp(FollowUp followUp, string username)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_FollowUp>(followUp);
                _followUpRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task UpdateFollowUp(FollowUp followUp, string username)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_FollowUp>(followUp);
                _followUpRepository.Update(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task RemoveFollowUp(int id, string username)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _followUpRepository.Delete(d => d.Id == id);
                await scope.SaveChangesAsync();
            }
        }
    }
}