using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class BeneficiaryTypeController : RmaApiController
    {
        private readonly IBeneficiaryTypeService _beneficiaryTypeRepository;

        public BeneficiaryTypeController(IBeneficiaryTypeService beneficiaryTypeRepository)
        {
            _beneficiaryTypeRepository = beneficiaryTypeRepository;
        }

        // GET: mdm/api/BeneficiaryType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var beneficiaryTypes = await _beneficiaryTypeRepository.GetBeneficiaryTypes();
            return Ok(beneficiaryTypes);
        }
    }
}