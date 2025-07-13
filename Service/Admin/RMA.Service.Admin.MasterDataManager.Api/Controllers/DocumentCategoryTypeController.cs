using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class DocumentCategoryTypeController : RmaApiController
    {
        private readonly IDocumentCategoryTypeService _documentCategoryTypeRepository;

        public DocumentCategoryTypeController(IDocumentCategoryTypeService documentCategoryTypeRepository)
        {
            _documentCategoryTypeRepository = documentCategoryTypeRepository;
        }

        // GET: mdm/api/DocumentCategoryType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var documentCategoryTypes = await _documentCategoryTypeRepository.GetDocumentCategoryTypes();
            return Ok(documentCategoryTypes);
        }
    }
}