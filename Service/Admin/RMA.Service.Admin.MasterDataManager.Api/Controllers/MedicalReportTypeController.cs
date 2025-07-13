using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class MedicalReportTypeController : RmaApiController
    {
        private readonly IMedicalReportTypeService _medicalReportTypeRepository;

        public MedicalReportTypeController(IMedicalReportTypeService medicalReportTypeRepository)
        {
            _medicalReportTypeRepository = medicalReportTypeRepository;
        }

        // GET: mdm/api/MedicalReportType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var medicalReportTypes = await _medicalReportTypeRepository.GetMedicalReportTypes();
            return Ok(medicalReportTypes);
        }
    }
}