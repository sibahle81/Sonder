using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class NatureOfBusinessController : RmaApiController
    {
        private readonly INatureOfBusinessService _natureOfBusinessRepository;

        public NatureOfBusinessController(INatureOfBusinessService natureOfBusinessRepository)
        {
            _natureOfBusinessRepository = natureOfBusinessRepository;
        }

        // GET: mdm/api/NatureOfBusiness
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NatureOfBusiness>>> Get()
        {
            var natureOfBusinesses = await _natureOfBusinessRepository.GetNatureOfBusinesses();
            return Ok(natureOfBusinesses);
        }

        // GET: mdm/api/NatureOfBusiness/GetNatureOfBusinessesAuditLogLookUp
        [HttpGet("GetNatureOfBusinessesAuditLogLookUp")]
        public async Task<ActionResult<IEnumerable<NatureOfBusiness>>> GetNatureOfBusinessesAuditLogLookUp()
        {
            var result = await _natureOfBusinessRepository.GetNatureOfBusinessesAuditLogLookUp();
            return Ok(result);
        }

        // GET: mdm/api/NatureOfBusiness/GetDescriptionByCode/{code}
        [HttpGet("GetDescriptionByCode/{code}")]
        public async Task<ActionResult<string>> GetDescriptionByCode(string code)
        {
            var result = await _natureOfBusinessRepository.GetNatureOfBusinessDescription(code);
            return Ok(result);
        }

        // GET: mdm/api/NatureOfBusiness/GetNatureOfBusinessByCode/{sicCode}
        [HttpGet("GetNatureOfBusinessByCode/{sicCode}")]
        public async Task<ActionResult<NatureOfBusiness>> GetNatureOfBusinessByCode(string sicCode)
        {
            var item = await _natureOfBusinessRepository.GetNatureOfBusinessByCode(sicCode);
            return Ok(item);
        }

        // GET: mdm/api/NatureOfBusiness/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<int>> Get(int id)
        {
            var natureOfBusiness = await _natureOfBusinessRepository.GetNatureOfBusinessById(id);
            return Ok(natureOfBusiness);
        }
    }
}