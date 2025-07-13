using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class RecipientTypeController : RmaApiController
    {
        private readonly IRecipientTypeService _recipientTypeRepository;

        public RecipientTypeController(IRecipientTypeService recipientTypeRepository)
        {
            _recipientTypeRepository = recipientTypeRepository;
        }

        // GET: mdm/api/RecipientType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var recipientTypes = await _recipientTypeRepository.GetRecipientTypes();
            return Ok(recipientTypes);
        }
    }
}