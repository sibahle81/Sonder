using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class MenuController : RmaApiController
    {
        private readonly IMenuService _menuRepository;

        public MenuController(IMenuService menuRepository)
        {
            _menuRepository = menuRepository;
        }

        // GET: mdm/api/Menu
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Menu>>> Get()
        {
            var menus = await _menuRepository.GetMenus().ConfigureAwait(false);
            return Ok(menus);
        }
        // GET: mdm/api/Menu/GetMenuGroups
        [HttpGet("GetMenuGroups")]
        public async Task<ActionResult<IEnumerable<MenuGroup>>> GetMenuGroups()
        {
            var menus = await _menuRepository.GetMenuGroups().ConfigureAwait(true);
            return Ok(menus);
        }
    }
}