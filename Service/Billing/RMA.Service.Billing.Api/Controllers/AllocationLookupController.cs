using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/Billing/[controller]")]

    public class AllocationLookupController : RmaApiController
    {
        private readonly IPaymentAllocationLookupService _paymentAllocationLookupService;

        public AllocationLookupController(IPaymentAllocationLookupService paymentAllocationService)
        {
            _paymentAllocationLookupService = paymentAllocationService;
        }

        [HttpGet("GetAllocationLookup/{allocationLookupId}")]
        public async Task<ActionResult<PaymentAllocationLookup>> GetAllocationLookup(int allocationLookupId)
        {
            var allocationLookup = await _paymentAllocationLookupService.GetAllocationLookup(allocationLookupId);

            if (allocationLookup == null)
                return NotFound($"No allocation was found with identifier [{allocationLookupId}].");

            return Ok(allocationLookup);
        }

        [HttpGet("GetAllocationLookups")]
        public async Task<ActionResult<List<PaymentAllocationLookup>>> GetAllocationLookups()
        {
            var allocationLookups = await _paymentAllocationLookupService.GetAllocationLookups();

            if (allocationLookups.Count == 0)
                return NotFound($"No allocation was found.");

            return Ok(allocationLookups);
        }

        [HttpGet("GetAllocationLookupsByDebtorNumber/{debtorNumber}")]
        public async Task<ActionResult<List<PaymentAllocationLookup>>> GetAllocationLookupsByDebtorNumber(string debtorNumber)
        {
            var allocationLookups = await _paymentAllocationLookupService.GetAllocationLookupsByDebtorNumber(debtorNumber);

            return Ok(allocationLookups);
        }

        [HttpPost("CreateAllocationLookups")]
        public async Task<ActionResult<bool>> CreateAllocationLookups([FromBody] List<PaymentAllocationLookup> allocationLookups)
        {
            var result = await _paymentAllocationLookupService.CreateAllocationLookups(allocationLookups);
            return Ok(result);
        }

        [HttpPost("EditAllocationLookups")]
        public async Task<ActionResult<bool>> EditAllocationLookups([FromBody] List<PaymentAllocationLookup> allocationLookups)
        {
            throw new NotImplementedException("Edit functionality doesn't exist yet");
            //var result = await _paymentAllocationLookupService.CreateAllocationLookups(allocationLookups);
            //return Ok(result);
        }

        [HttpPost("DeleteAllocationLookup")]
        public async Task<ActionResult<bool>> DeleteAllocationLookup([FromBody] int allocationLookupId)
        {
            var result = await _paymentAllocationLookupService.DeleteAllocationLookup(allocationLookupId);
            return Ok(result);
        }
    }
}