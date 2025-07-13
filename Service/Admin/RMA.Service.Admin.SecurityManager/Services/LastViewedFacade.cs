using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;
using RMA.Service.Audit.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class LastViewedFacade : RemotingStatelessService, ILastViewedService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ILastViewedV1Service _lastViewedService;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_User> _userRepository;
        private readonly IMapper _mapper;

        public LastViewedFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactor,
            IRepository<security_Role> roleRepository,
            IRepository<security_User> userRepository,
            ILastViewedV1Service lastViewedService,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactor;
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _lastViewedService = lastViewedService;
            _mapper = mapper;
        }

        public async Task<List<Role>> GetLastViewedRoles()
        {
            string username = RmaIdentity.Username;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(username, typeof(security_Role).Name);
                var ids = lastViewedItems
                    .Select(lastViewedItem => lastViewedItem.ItemId)
                    .ToList();

                var roles = await _roleRepository
                    .Where(role => ids.Contains(role.Id))
                    .ProjectTo<Role>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                roles.ForEach(policy =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == policy.Id);
                    if (lastViewedItem != null) policy.DateViewed = lastViewedItem.Date;
                });

                return roles.OrderByDescending(policy => policy.DateViewed).Take(5).ToList();
            }
        }

        public async Task<List<User>> GetLastViewedUsers()
        {
            string username = RmaIdentity.Username;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewItems = await GetLastViewedItemsForUser(username, typeof(security_User).Name);
                var ids = lastViewItems.Select(a => a.ItemId);

                var userEntity = await _userRepository
                    .Where(u => ids.Contains(u.Id))
                    .OrderBy(u => u.DisplayName)
                    .ToListAsync();

                var users = _mapper.Map<List<User>>(userEntity);

                users.ForEach(userViewed =>
                {
                    var lastViewedItem = lastViewItems.FirstOrDefault(item => item.ItemId == userViewed.Id);
                    if (lastViewedItem != null) userViewed.DateViewed = lastViewedItem.Date;
                });

                foreach (var lastViewedUser in users)
                {
                    var role = await _roleRepository
                        .FirstOrDefaultAsync(s => s.Id == lastViewedUser.RoleId);

                    lastViewedUser.RoleName = role != null ? role.Name : "N/A";

                    if (string.IsNullOrEmpty(lastViewedUser.Name) && !string.IsNullOrEmpty(lastViewedUser.DisplayName))
                    {
                        lastViewedUser.Name = lastViewedUser.DisplayName;
                    }
                    else
                    {
                        lastViewedUser.Name = "N/A";
                    }
                }

                return users.OrderByDescending(policy => policy.DateViewed).Take(5).ToList();
            }
        }


        private async Task<List<LastViewedItem>> GetLastViewedItemsForUser(string user, string itemTypeName)
        {
            var detail = await _lastViewedService.GetLastViewedItemsForUser(user, itemTypeName, 5);
            return detail
                  .Select(n => new LastViewedItem()
                  {
                      ItemId = n.ItemId,
                      Date = n.Date
                  }).ToList();
        }
    }
}