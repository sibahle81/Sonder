using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Document;
using Document = RMA.Service.ClaimCare.Contracts.Entities.Document;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class DocumentController : RmaApiController
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        //GET: clm/api/Document/GetDocumentsWithClaimId/{claimId}
        [HttpGet("GetDocumentsWithClaimId/{claimId}")]
        public async Task<ActionResult<IEnumerable<Document>>> GetDocumentsWithClaimId(int claimId)
        {
            var results = await _documentService.GetDocumentsWithClaimId(claimId);
            return Ok(results);
        }

        //PUT: clm/api/Document/AddInDocumentToken/{claimId}/{documentType}/{documentToken}
        [HttpPut("AddInDocumentToken/{claimId}/{documentType}/{documentToken}")]
        public async Task AddInDocumentToken(int claimId, DocumentTypeEnum documentType, string documentToken)

        {
            await _documentService.AddInDocumentToken(claimId, documentType, documentToken);
        }

        //GET: clm/api/Document/GetDocumentTypesWithClaimId/{claimId}
        [HttpGet("GetDocumentTypesWithClaimId/{claimId}")]
        public async Task<ActionResult<IEnumerable<Document>>> GetDocumentTypesWithClaimId(int claimId)
        {
            var results = await _documentService.GetDocumentType(claimId);
            return Ok(results);
        }

        [HttpGet("GetDocumentTypesNotUploaded/{claimId}")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetDocumentTypesNotUploaded(int claimId)
        {
            var results = await _documentService.GetDocumentTypesNotUploaded(claimId);
            return Ok(results);
        }

        [HttpPut("UpdateDocument")]
        public async Task UpdateDocument([FromBody] Document document)
        {
            await _documentService.UpdateDocument(document);
        }

        [HttpPost("AddAdditionalDocuments")]
        public async Task<bool> AddAdditionalDocuments([FromBody] AdditionalDocument additionalDocument)
        {
            var result = await _documentService.AddAdditionalDocuments(additionalDocument);
            return result;
        }
       
        [HttpGet("GetDocumentManagementHeader/{claimId}")]
        public async Task<ActionResult<IEnumerable<DocumentManagementHeader>>> GetDocumentManagementHeader(int claimId)
        {
            var results = await _documentService.GetDocumentManagementHeader(claimId);
            return Ok(results);
        }
        
    }
}