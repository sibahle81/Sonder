using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class UnderwriterController : RmaApiController
    {
        private readonly IUnderwriterService _underwriterService;

        public UnderwriterController(IUnderwriterService underwriterService)
        {
            _underwriterService = underwriterService;
        }

        [HttpGet]
        public async Task<List<Underwriter>> GetUnderwriters()
        {
            var underwriters = await _underwriterService.GetUnderwriters();
            return underwriters;
        }

        [HttpGet("ById/{underwriterId}")]
        public async Task<Underwriter> GetUnderwriter(int underwriterId)
        {
            var underwriter = await _underwriterService.GetUnderwriter(underwriterId);
            return underwriter;
        }
    }
}