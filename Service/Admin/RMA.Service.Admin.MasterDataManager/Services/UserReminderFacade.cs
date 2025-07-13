using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class UserReminderFacade : RemotingStatelessService, IUserReminderService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_UserReminder> _userReminderRepository;
        private readonly IMapper _mapper;

        public UserReminderFacade(IDbContextScopeFactory dbContextScopeFactory,
        IRepository<common_UserReminder> userReminderRepository,
        StatelessServiceContext context,
        IMapper mapper) : base(context)
        {
            _userReminderRepository = userReminderRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<int> CreateUserReminder(UserReminder userReminder)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_UserReminder>(userReminder);

                entity = _userReminderRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.UserReminderId;
            }
        }

        public async Task<int> CreateUserReminders(List<UserReminder> userReminders)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = _mapper.Map<List<common_UserReminder>>(userReminders);

                var createdEntities = _userReminderRepository.Create(entities);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> UpdateUserReminder(UserReminder userReminder)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_UserReminder>(userReminder);

                _userReminderRepository.Update(entity);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> UpdateUserReminders(List<UserReminder> userReminders)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = _mapper.Map<List<common_UserReminder>>(userReminders);

                _userReminderRepository.Update(entities);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<bool> CheckUserHasAlerts(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return _userReminderRepository.Any(a => a.AssignedToUserId == userId && a.AlertDateTime < DateTimeHelper.SaNow && !a.IsDeleted);
            }
        }

        public async Task<PagedRequestResult<UserReminder>> GetPagedUserReminders(UserReminderSearchRequest userReminderSearchRequest)
        {
           Contract.Requires(userReminderSearchRequest!=null);
           Contract.Requires(userReminderSearchRequest.PagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                PagedRequestResult<common_UserReminder> userReminders = new PagedRequestResult<common_UserReminder>();
                var itemId = Convert.ToInt32(userReminderSearchRequest.ItemId);
                var userReminderItemType = userReminderSearchRequest.UserReminderItemType;
                var usersFilter = userReminderSearchRequest.UsersFilter;
                if (userReminderSearchRequest.UserId > 0)
                {
                    if (userReminderSearchRequest.GetAlerts)
                    {
                        if (usersFilter?.Count > 0)
                        {
                            userReminders = await _userReminderRepository.Where(a => a.AssignedToUserId == userReminderSearchRequest.UserId
                                && a.AlertDateTime < DateTimeHelper.SaNow
                                && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                                && userReminderSearchRequest.UsersFilter.Contains(a.AssignedByUserId.Value)
                                && !a.IsDeleted)
                            .ToPagedResult(userReminderSearchRequest.PagedRequest);
                        }
                        else
                        {
                            userReminders = await _userReminderRepository.Where(a => a.AssignedToUserId == userReminderSearchRequest.UserId
                                && a.AlertDateTime < DateTimeHelper.SaNow
                                && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                                && !a.IsDeleted)
                            .ToPagedResult(userReminderSearchRequest.PagedRequest);
                        }
                    }
                    else
                    {
                        if (userReminderItemType != null && itemId <= 0)
                        {
                            if (usersFilter?.Count > 0)
                            {
                                userReminders = await _userReminderRepository.Where(a => a.AssignedToUserId == userReminderSearchRequest.UserId
                                    && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                                    && userReminderSearchRequest.UsersFilter.Contains(a.AssignedByUserId.Value)
                                    && a.UserReminderItemType == userReminderItemType
                                    && !a.IsDeleted)
                                .ToPagedResult(userReminderSearchRequest.PagedRequest);
                            }
                            else
                            {
                                userReminders = await _userReminderRepository.Where(a => a.AssignedToUserId == userReminderSearchRequest.UserId
                                    && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                                    && a.UserReminderItemType == userReminderItemType
                                    && !a.IsDeleted)
                                .ToPagedResult(userReminderSearchRequest.PagedRequest);
                            }
                        }
                        else
                        {
                            if (usersFilter?.Count > 0)
                            {
                                userReminders = await _userReminderRepository.Where(a => a.AssignedToUserId == userReminderSearchRequest.UserId
                                && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                                && userReminderSearchRequest.UsersFilter.Contains(a.AssignedByUserId.Value)
                                && !a.IsDeleted)
                            .ToPagedResult(userReminderSearchRequest.PagedRequest);
                            }
                            else
                            {
                                userReminders = await _userReminderRepository.Where(a => a.AssignedToUserId == userReminderSearchRequest.UserId
                                && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                                && !a.IsDeleted)
                            .ToPagedResult(userReminderSearchRequest.PagedRequest);
                            }
                        }
                    }
                }
                else if (userReminderSearchRequest.UserReminderItemType > 0 && itemId > 0 && !userReminderSearchRequest.GetAlerts)
                {
                    userReminders = await _userReminderRepository.Where(a => Convert.ToInt32(a.UserReminderItemType) == Convert.ToInt32(userReminderSearchRequest.UserReminderItemType)
                        && Convert.ToInt32(a.ItemId) == Convert.ToInt32(userReminderSearchRequest.ItemId)
                        && userReminderSearchRequest.UserReminderTypes.Contains(a.UserReminderType)
                        && !a.IsDeleted)
                    .ToPagedResult(userReminderSearchRequest.PagedRequest);
                }

                var data = _mapper.Map<List<UserReminder>>(userReminders.Data);

                return new PagedRequestResult<UserReminder>
                {
                    Page = userReminderSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(userReminders.RowCount / (double)userReminderSearchRequest.PagedRequest.PageSize),
                    RowCount = userReminders.RowCount,
                    PageSize = userReminderSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task<int> CheckMessageCount(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userReminders = await _userReminderRepository.Where(s => s.AssignedToUserId == userId && !s.IsDeleted).ToListAsync();
                return userReminders.Count;
            }
        }
    }

}