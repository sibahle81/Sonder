using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class DocumentCategoryController : RmaApiController
    {
        private readonly IDocumentCategoryService _documentCategoryRepository;

        public DocumentCategoryController(IDocumentCategoryService documentCategoryRepository)
        {
            _documentCategoryRepository = documentCategoryRepository;
        }

        // GET: mdm/api/DocumentCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lookup>>> Get()
        {
            var documentCategories = await _documentCategoryRepository.GetDocumentCategories();
            return Ok(documentCategories);
        }
    }
}