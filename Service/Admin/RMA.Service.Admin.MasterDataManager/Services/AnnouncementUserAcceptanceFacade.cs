using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class AnnouncementUserAcceptanceFacade : RemotingStatelessService, IAnnouncementUserAcceptanceService
    {
        private readonly IRepository<common_AnnouncementUserAcceptance> _announcementUserAcceptanceRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public AnnouncementUserAcceptanceFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_AnnouncementUserAcceptance> announcementUserAcceptanceRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _announcementUserAcceptanceRepository = announcementUserAcceptanceRepository;
            _mapper = mapper;
        }

        public async Task<int> AddAnnouncementUserAcceptance(AnnouncementUserAcceptance announcementUserAcceptance)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_AnnouncementUserAcceptance>(announcementUserAcceptance);
                _announcementUserAcceptanceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.AnnouncementUserAcceptanceId;
            }
        }
    }
}
