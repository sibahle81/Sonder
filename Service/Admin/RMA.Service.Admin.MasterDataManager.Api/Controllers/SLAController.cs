using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class SLAController : RmaApiController
    {
        private readonly ISLAService _slaService;

        public SLAController(ISLAService slaService)
        {
            _slaService = slaService;
        }

        [HttpGet("GetSLAItemTypeConfiguration/{slaItemType}")]
        public async Task<ActionResult<SlaItemTypeConfiguration>> GetSLAItemTypeConfiguration(SLAItemTypeEnum slaItemType)
        {
            var slaItemTypeConfiguration = await _slaService.GetSLAItemTypeConfiguration(slaItemType);
            return Ok(slaItemTypeConfiguration);
        }

        [HttpGet("GetSLAItemTypeConfigurations")]
        public async Task<ActionResult<List<SlaItemTypeConfiguration>>> GetSLAItemTypeConfigurations()
        {
            var slaItemTypeConfiguration = await _slaService.GetSLAItemTypeConfigurations();
            return Ok(slaItemTypeConfiguration);
        }

        [HttpPost("GetSLAStatusChangeAudits")]
        public async Task<ActionResult<List<SlaStatusChangeAudit>>> GetSLAStatusChangeAudits([FromBody] SlaStatusChangeAudit slaStatusChangeAudit)
        {
            if (slaStatusChangeAudit != null)
            {
                return Ok(await _slaService.GetSLAStatusChangeAudits(slaStatusChangeAudit.SLAItemType, slaStatusChangeAudit.ItemId));
            }
            return Ok();
        }

        [HttpPost("GetPagedSLAStatusChangeAudits")]
        public async Task<ActionResult<PagedRequestResult<SlaStatusChangeAudit>>> GetPagedSLAStatusChangeAudits([FromBody] SlaStatusChangeAuditSearchRequest slaStatusChangeAuditSearchRequest)
        {
            var result = await _slaService.GetPagedSLAStatusChangeAudits(slaStatusChangeAuditSearchRequest);
            return Ok(result);
        }
    }
}