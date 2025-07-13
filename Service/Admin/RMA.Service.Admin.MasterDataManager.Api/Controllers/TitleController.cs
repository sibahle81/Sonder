using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class TitleController : RmaApiController
    {
        private readonly ITitleService _titleRepository;

        public TitleController(ITitleService titleRepository)
        {
            _titleRepository = titleRepository;
        }

        // GET: mdm/api/Title
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var titles = await _titleRepository.GetTitles();
            return Ok(titles);
        }
    }
}