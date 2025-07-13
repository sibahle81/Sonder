using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class RequiredDocumentController : RmaApiController
    {
        private readonly IRequiredDocumentService _requiredDocumentService;

        public RequiredDocumentController(IRequiredDocumentService requiredDocumentRepository)
        {
            _requiredDocumentService = requiredDocumentRepository;
        }

        // GET: mdm/api/RequiredDocument
        [HttpGet]
        public async Task<ActionResult<List<RequiredDocument>>> Get()
        {
            var requiredDocuments = await _requiredDocumentService.GetRequiredDocuments();
            return Ok(requiredDocuments);
        }

        // GET: mdm/api/RequiredDocument/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RequiredDocument>> Get(int id)
        {
            var requiredDocument = await _requiredDocumentService.GetRequiredDocument(id);
            return Ok(requiredDocument);
        }

        // POST: mdm/api/RequiredDocument/{requiredDocument}
        [HttpPost]
        public async Task<ActionResult<int>> Post(RequiredDocument requiredDocument)
        {
            var id = await _requiredDocumentService.AddRequiredDocument(requiredDocument);
            return Ok(id);
        }

        // PUT: mdm/api/RequiredDocument/{requiredDocument}
        [HttpPut]
        public async Task<ActionResult> Put(RequiredDocument requiredDocument)
        {
            await _requiredDocumentService.EditRequiredDocument(requiredDocument);
            return Ok();
        }

        // DELETE: mdm/api/RequiredDocument/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _requiredDocumentService.RemoveRequiredDocument(id);
            return Ok();
        }

        // GET: mdm/api/RequiredDocument
        [HttpGet("{moduleId}/{documentCategory}")]
        public async Task<ActionResult<IEnumerable<RequiredDocument>>> Get(int moduleId, DocumentCategoryEnum documentCategory)
        {
            var requiredDocuments =
                await _requiredDocumentService.GetRequiredDocumentsByModuleCategory(moduleId, documentCategory);
            return Ok(requiredDocuments);
        }
    }
}