using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class AnnouncementRoleFacade : RemotingStatelessService, IAnnouncementRoleService
    {
        private readonly IRepository<common_AnnouncementRole> _announcementRoleRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public AnnouncementRoleFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_AnnouncementRole> announcementRoleRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _announcementRoleRepository = announcementRoleRepository;
            _mapper = mapper;
        }

        public async Task<int> AddAnnouncementRole(AnnouncementRole announcementRole)
        {
            RmaIdentity.DemandPermission(Permissions.CreateAnnouncementRole);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_AnnouncementRole>(announcementRole);
                _announcementRoleRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return entity.AnnouncementRoleId;
            }
        }

        public async Task EditAnnouncementRole(AnnouncementRole announcementRole)
        {
            Contract.Requires(announcementRole != null);
            RmaIdentity.DemandPermission(Permissions.EditAnnouncementRole);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _announcementRoleRepository.FirstOrDefaultAsync(a => a.AnnouncementRoleId == announcementRole.AnnouncementRoleId);

                entity.AnnouncementId = announcementRole.AnnouncementId;
                entity.RoleId = announcementRole.RoleId;
                entity.IsDeleted = announcementRole.IsDeleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _announcementRoleRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task RemoveAnnouncementRolesByAnnouncementId(int announcementId)
        {
            RmaIdentity.DemandPermission(Permissions.RemoveAnnouncementRole);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = await _announcementRoleRepository
                    .Where(a => a.AnnouncementId == announcementId)
                    .ToListAsync();

                foreach (var item in entities)
                    item.IsDeleted = true;

                _announcementRoleRepository.Update(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<AnnouncementRole>> GetAnnouncementRoles()
        {
            RmaIdentity.DemandPermission(Permissions.ViewAnnouncementRole);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _announcementRoleRepository
                    .ProjectTo<AnnouncementRole>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
        }

        public async Task<List<AnnouncementRole>> GetAnnouncementRolesByAnnouncementId(int announcementId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewAnnouncementRole);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _announcementRoleRepository
                    .Where(a => a.AnnouncementId == announcementId)
                    .ProjectTo<AnnouncementRole>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
        }
    }
}
