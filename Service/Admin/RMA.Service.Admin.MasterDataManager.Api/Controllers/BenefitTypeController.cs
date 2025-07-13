using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BenefitTypeController : RmaApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var benefitTypes = await Task.Run(() => typeof(BenefitTypeEnum).ToLookupList());
            return Ok(benefitTypes);
        }
    }
}