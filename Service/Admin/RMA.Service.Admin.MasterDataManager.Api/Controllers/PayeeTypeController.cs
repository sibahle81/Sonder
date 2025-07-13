using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class PayeeTypeController : RmaApiController
    {
        private readonly IPayeeTypeService _payeeTypeRepository;

        public PayeeTypeController(IPayeeTypeService payeeTypeRepository)
        {
            _payeeTypeRepository = payeeTypeRepository;
        }

        // GET: mdm/api/PayeeType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayeeType>>> Get()
        {
            var payeeTypes = await _payeeTypeRepository.GetPayeeTypes();
            return Ok(payeeTypes);
        }

        // GET: mdm/api/PayeeType/GetPayeeTypeById/{payeeTypeId}
        [HttpGet("GetPayeeTypeById/{payeeTypeId}")]
        public async Task<ActionResult<PayeeType>> GetPayeeTypeById(int payeeTypeId)
        {
            var payeeType = await _payeeTypeRepository.GetPayeeTypeById(payeeTypeId);
            return Ok(payeeType);
        }
    }
}