using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PaymentMethodController : RmaApiController
    {
        private readonly IPaymentMethodService _paymentMethodRepository;

        public PaymentMethodController(IPaymentMethodService paymentMethodRepository)
        {
            _paymentMethodRepository = paymentMethodRepository;
        }

        // GET: mdm/api/PaymentMethod
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var paymentMethods = await _paymentMethodRepository.GetPaymentMethods();
            return Ok(paymentMethods);
        }

        [HttpGet("GetPaymentFrequencyByIds")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetPaymentFrequencyByIds([FromQuery] List<int> id)
        {
            var coverTypes = await _paymentMethodRepository.GetPaymentFrequencyByIds(id);
            return Ok(coverTypes);
        }
    }
}