using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Constants;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class MenuFacade : RemotingStatelessService, IMenuService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Menu> _menuRepository;
        private readonly IModuleService _moduleService;
        private readonly IMapper _mapper;

        public MenuFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IModuleService moduleService,
            IRepository<common_Menu> menuRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _moduleService = moduleService;
            _menuRepository = menuRepository;
            _mapper = mapper;
        }

        public async Task<List<Menu>> GetMenus()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (RmaIdentity.RoleId == SystemSettings.AdministratorRoleId)
                {
                    return await _menuRepository
                          .Where(menu => menu.IsActive && !menu.IsDeleted)
                          .OrderBy(menu => menu.OderIndex)
                          .ProjectTo<Menu>(_mapper.ConfigurationProvider)
                          .ToListAsync();
                }

                return await _menuRepository.SqlQueryAsync<Menu>(DatabaseConstants.GetMenuForUser,
                        new SqlParameter("UserId", RmaIdentity.UserId));
            }
        }

        public async Task<List<MenuGroup>> GetMenuGroups()
        {
            var modules = await _moduleService.GetModules();
            var menus = await GetMenus();

            var menuGroups = new List<MenuGroup>();
            foreach (var module in modules)
            {
                var menuItems = menus
                    .Where(menu => menu.ModuleId == module.Id)
                    .OrderBy(menu => menu.OderIndex)
                    .Select(menu => new Menu
                    {
                        Title = menu.Title,
                        Url = menu.Url,
                        Api = menu.Api
                    }).ToList();

                if (menuItems?.Count > 0)
                {
                    menuGroups.Add(new MenuGroup
                    {
                        Title = module.Name,
                        Acronym = module.Acronym,
                        MenuItems = menuItems
                    });
                }
            }

            return SetActiveApi(menuGroups);
        }

        private static List<MenuGroup> SetActiveApi(List<MenuGroup> menuGroups)
        {
            foreach (var menuGroup in menuGroups)
            {
                foreach (var menuItem in menuGroup.MenuItems)
                {
                    if (menuItem.Title.Equals("Config Manager"))
                    {
                        menuItem.IsActive = true;
                        menuItem.Url = "/config-manager";
                    }
                    else
                    {
                        //TODO when required read the active modules from the configuration settings
                        menuItem.IsActive = true;
                    }

                    if (!menuItem.IsActive) menuItem.Url = string.Empty;
                }
            }

            return menuGroups;
        }
    }
}