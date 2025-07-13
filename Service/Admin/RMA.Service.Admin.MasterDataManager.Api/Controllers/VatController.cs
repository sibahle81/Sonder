using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class VatController : RmaApiController
    {
        private readonly IVatService _vatRepository;

        public VatController(IVatService vatRepository)
        {
            _vatRepository = vatRepository;
        }

        // GET: mdm/api/Vat
        [HttpGet("GetVatAmount/{vatCodeId}/{serviceDate}")]
        public async Task<ActionResult<decimal>> GetVatAmount(int vatCodeId, DateTime serviceDate)
        {
            return await _vatRepository.GetVatAmount(vatCodeId, serviceDate);
        }

    }
}
