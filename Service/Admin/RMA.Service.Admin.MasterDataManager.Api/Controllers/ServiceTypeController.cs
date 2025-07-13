using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ServiceTypeController : RmaApiController
    {
        private readonly IServiceTypeService _serviceTypeRepository;

        public ServiceTypeController(IServiceTypeService serviceTypeRepository)
        {
            _serviceTypeRepository = serviceTypeRepository;
        }

        // GET: mdm/api/ServiceType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var serviceTypes = await _serviceTypeRepository.GetServiceTypes();
            return Ok(serviceTypes);
        }
    }
}