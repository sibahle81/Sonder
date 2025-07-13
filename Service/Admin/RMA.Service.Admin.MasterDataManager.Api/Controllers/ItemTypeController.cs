using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ItemTypeController : RmaApiController
    {
        private readonly IItemTypeService _repository;

        public ItemTypeController(IItemTypeService repository)
        {
            _repository = repository;
        }

        // GET: mdm/api/ItemType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemType>>> Get()
        {
            return Ok(await _repository.GetItemTypes());
        }
    }
}