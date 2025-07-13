using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class AuthorityLimitController : RmaApiController
    {
        private readonly IAuthorityLimitService _authorityLimitService;

        public AuthorityLimitController(IAuthorityLimitService authorityLimitService)
        {
            _authorityLimitService = authorityLimitService;
        }

        [HttpPost("CheckUserHasAuthorityLimit")]
        public async Task<ActionResult<AuthorityLimitResponse>> CheckUserHasAuthorityLimit([FromBody] AuthorityLimitRequest authorityLimitRequest)
        {
            var result = await _authorityLimitService.CheckUserHasAuthorityLimit(authorityLimitRequest);
            return Ok(result);
        }

        [HttpPost("CreateUserAuthorityLimitConfigurationAudit")]
        public async Task<ActionResult<bool>> CreateUserAuthorityLimitConfigurationAudit([FromBody] AuthorityLimitRequest authorityLimitRequest)
        {
            var result = await _authorityLimitService.CreateUserAuthorityLimitConfigurationAudit(authorityLimitRequest);
            return Ok(result);
        }

        [HttpPost("GetPagedAuthorityLimits")]
        public async Task<ActionResult<PagedRequestResult<AuthorityLimitConfiguration>>> GetPagedAuthorityLimits([FromBody] AuthorityLimitSearchRequest authorityLimitSearchRequest)
        {
            var results = await _authorityLimitService.GetPagedAuthorityLimits(authorityLimitSearchRequest);
            return Ok(results);
        }

        [HttpGet("GetAuthorityLimitItemTypesPermissions")]
        public async Task<ActionResult<List<AuthorityLimitItemTypePermissions>>> GetAuthorityLimitItemTypesPermissions()
        {
            var results = await _authorityLimitService.GetAuthorityLimitItemTypesPermissions();
            return Ok(results);
        }

        [HttpPost("UpdateAuthorityLimits")]
        public async Task<ActionResult<bool>> UpdateAuthorityLimits([FromBody] List<AuthorityLimitConfiguration> authorityLimitConfigurations)
        {
            var result = await _authorityLimitService.UpdateAuthorityLimits(authorityLimitConfigurations);
            return Ok(result);
        }
    }
}