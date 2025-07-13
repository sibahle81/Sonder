// System
//Common
using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
//Master
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class AnnouncementFacade : RemotingStatelessService, IAnnouncementService
    {
        private readonly IRepository<common_Announcement> _announcementRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public AnnouncementFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Announcement> announcementRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _announcementRepository = announcementRepository;
            _mapper = mapper;
        }

        public async Task<int> AddAnnouncement(Announcement announcement)
        {
            Contract.Requires(announcement != null);
            RmaIdentity.DemandPermission(Permissions.CreateAnnouncement);

            using (var scope = _dbContextScopeFactory.Create())
            {
                announcement.StartDate = announcement.StartDate.ToSaDateTime();
                announcement.EndDate = announcement.EndDate.ToSaDateTime();
                var entity = _mapper.Map<common_Announcement>(announcement);
                _announcementRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                return entity.AnnouncementId;
            }
        }

        public async Task EditAnnouncement(Announcement announcement)
        {
            Contract.Requires(announcement != null);
            RmaIdentity.DemandPermission(Permissions.EditAnnouncement);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _announcementRepository.FirstOrDefaultAsync(a => a.AnnouncementId == announcement.AnnouncementId);

                entity.Name = announcement.Name;
                entity.Description = announcement.Description;
                entity.Html = announcement.Html;
                entity.IsMandatory = announcement.IsMandatory;
                entity.PriorityId = announcement.PriorityId;
                entity.IncludeAllRoles = announcement.IncludeAllRoles;
                entity.StartDate = announcement.StartDate.ToSaDateTime();
                entity.EndDate = announcement.EndDate.ToSaDateTime();
                entity.IsDeleted = announcement.IsDeleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _announcementRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Announcement>> GetAnnouncements()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var announcements = await _announcementRepository.ToListAsync();

                return _mapper.Map<List<Announcement>>(announcements);
            }
        }

        public async Task<PagedRequestResult<Announcement>> GetPagedAnnouncements(PagedRequest request)
        {
            if (request == null) return new PagedRequestResult<Announcement>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var announcements = await _announcementRepository
                    .Select(a => new
                    {
                        announcement = a,
                        name = a.Name,
                        isMandatory = a.IsMandatory,
                        includeAllRoles = a.IncludeAllRoles,
                        startDate = a.StartDate,
                        endDate = a.EndDate
                    })
                    .ToPagedResult(request);

                if (announcements.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<Announcement>
                    {
                        Page = announcements.Page,
                        PageCount = announcements.PageCount,
                        RowCount = announcements.RowCount,
                        PageSize = announcements.PageSize,
                        Data = new List<Announcement>()
                    };

                    var mappedAnnouncement = _mapper.Map<List<Announcement>>(announcements.Data.Select(t => t.announcement));
                    foreach (var item in mappedAnnouncement)
                    {
                        returnResult.Data.Add(item);
                    }

                    return returnResult;
                }

                return new PagedRequestResult<Announcement>();
            }
        }

        public async Task<Announcement> GetAnnouncementById(int announcementId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var announcement = await _announcementRepository
                    .SingleAsync(a => a.AnnouncementId == announcementId);

                return _mapper.Map<Announcement>(announcement);
            }
        }

        public async Task<List<Announcement>> GetAnnouncementsByUserId(int userId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var announcements = await _announcementRepository.SqlQueryAsync<Announcement>("[common].[GetAnnouncementsForUser] @UserId", new SqlParameter { ParameterName = "@UserId", Value = userId });

                announcements.Sort((x, y) => { return x.PriorityId.CompareTo(y.PriorityId); });

                return announcements;
            }
        }

        public async Task<int> GetAnnouncementCountForUserId(int userId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _announcementRepository.SqlQueryAsync<Announcement>("[common].[GetAnnouncementsForUser] @UserId", new SqlParameter { ParameterName = "@UserId", Value = userId });

                return entity.Count;
            }
        }
    }
}
