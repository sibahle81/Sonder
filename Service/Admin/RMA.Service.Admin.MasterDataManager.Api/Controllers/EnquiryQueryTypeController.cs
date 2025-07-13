using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class EnquiryQueryTypeController : RmaApiController
    {
        private readonly IEnquiryQueryTypeService _queryRepository;

        public EnquiryQueryTypeController(IEnquiryQueryTypeService queryRepository)
        {
            _queryRepository = queryRepository;
        }

        // GET: mdm/api/EnquiryQueryType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            return Ok(await _queryRepository.GetEnquiryQueryTypes());
        }
    }
}