using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Api.Controllers.Document
{
    [Route("api/Document/[controller]")]
    public class DocumentController : RmaApiController
    {
        private readonly IDocumentIndexService _documentIndexService;

        public DocumentController(IDocumentIndexService documentIndexService)
        {
            _documentIndexService = documentIndexService;
        }

        // GET scn/api/Document/Document/GetDocumentTypeBySetId/
        [AllowAnonymous]
        [HttpGet("GetDocumentTypeBySetId/{documentSet}")]
        public async Task<List<DocumentType>> GetDocumentTypeBySetId(DocumentSetEnum documentSet)
        {
            var documentTypes = await _documentIndexService.GetDocumentTypeBySetId(documentSet);
            return documentTypes;
        }

        // GET scn/api/Document/Document/GetDocumentsBySetAndKey/

        [AllowAnonymous]
        [HttpPost("GetDocumentsBySetAndKey")]
        public async Task<List<Contracts.Entities.Document>> GetDocumentsBySetAndKey([FromBody] DocumentRequest documentRequest)
        {
            if (documentRequest == null) throw new ArgumentNullException(nameof(documentRequest));
            var documents = await _documentIndexService.GetDocumentsBySetAndKey(documentRequest.DocumentSet, documentRequest.Keys);
            return documents;
        }

        // GET scn/api/Document/Document/GetDocumentBinary/{docId}/{docUri}
        [AllowAnonymous]
        [HttpGet("GetDocumentBinary/{docId}")]
        public async Task<Contracts.Entities.Document> GetDocumentBinary(int docId)
        {
            return await _documentIndexService.GetDocumentBinary(docId);
        }

        // POST scn/api/Document/Document/SaveUpload/
        [HttpPost("SaveUpload")]
        public async Task<Contracts.Entities.Document> SaveUpload([FromBody] Contracts.Entities.Document document)
        {
            return await _documentIndexService.UploadDocument(document);
        }

        // POST scn/api/Document/Document/SaveUploadMemberPortal/
        [AllowAnonymous]
        [HttpPost("SaveUploadMemberPortal")]
        public async Task<Contracts.Entities.Document> SaveUploadMemberPortal([FromBody] Contracts.Entities.Document document)
        {
            return await _documentIndexService.UploadDocument(document);
        }

        // PUT scn/api/Document/Document/UpdateDocument
        [AllowAnonymous]
        [HttpPut("UpdateDocument")]
        public async Task UpdateDocument([FromBody] Contracts.Entities.Document document)
        {
            await _documentIndexService.UpdateDocument(document);
        }

        // Get scn/api/Document/Document/UpdateDocument
        [HttpGet("GetAllDocumentsTypeNotInDocuments/{documentSet}")]
        public async Task<List<Contracts.Entities.DocumentType>> GetAllDocumentsTypeNotInDocuments(DocumentSetEnum documentSet)
        {
            return await _documentIndexService.GetAllDocumentsTypeNotInDocuments(documentSet);
        }


        [HttpPut("UpdateDocumentKeyValues/{oldKeyValue}/{newKeyValue}")] // DO NOT USE THIS METHOD THIS MUST BE REMOVED
        public async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            return await _documentIndexService.UpdateDocumentKeyValues(oldKeyValue, newKeyValue);
        }

        // GET scn/api/Document/Document/GetDocumentsBySetAndKey/
        [HttpPost("GetAllDocumentsNotRecieved")]
        public async Task<List<Contracts.Entities.Document>> GetAllDocumentsNotRecieved([FromBody] DocumentRequest documentRequest)
        {
            //Passing Id into THis. Remove sometime comment..
            if (documentRequest == null) throw new ArgumentNullException(nameof(documentRequest));
            var test = await _documentIndexService.GetAllDocumentsNotRecieved(documentRequest.DocumentSet, documentRequest.Keys);
            return test;
        }

        // Get scn/api/Document/Document/GetDocumentsTypeByDocumentSet/documentSet
        [HttpGet("GetDocumentsTypeByDocumentSet/{documentSet}")]
        public async Task<List<DocumentSetDocumentType>> GetDocumentsTypeByDocumentSet(DocumentSetEnum documentSet)
        {
            var results = await _documentIndexService.GetDocumentsTypeByDocumentSet(documentSet);
            return results;
        }

        // Get scn/api/Document/Document/GetDocumentTypeName/documentTypeId
        [HttpGet("GetDocumentTypeName/{documentTypeId}")]
        public async Task<string> GetDocumentsTypeByDocumentSet(int documentTypeId)
        {
            return await _documentIndexService.GetDocumentTypeName(documentTypeId);
        }

        // Get scn/api/Document/Document/GetCombinedDocumentsTypeByDocumentSet/documentSet
        [HttpGet("GetCombinedDocumentsTypeByDocumentSet/{documentSet1}/{documentSet2}")]
        public async Task<List<DocumentSetDocumentType>> GetCombinedDocumentsTypeByDocumentSet(DocumentSetEnum documentSet1, DocumentSetEnum documentSet2)
        {
            return await _documentIndexService.GetCombinedDocumentsTypeByDocumentSet(documentSet1, documentSet2);
        }

        [HttpGet("GetDocumentById/{documentId}")]
        public async Task<ActionResult> GetDocumentById(int documentId)
        {
            var result = await _documentIndexService.GetDocumentById(documentId);
            return Ok(result);
        }

        [HttpGet("GetPagedDocumentsByKey/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<GenericDocument>>> GetPagedDocumentsByKey(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var documents = await _documentIndexService.GetPagedDocumentsByKey(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(documents);
        }

        [AllowAnonymous]
        [HttpGet("GetDocumentsByKey/{keyName}/{keyValue}")]
        public async Task<ActionResult<List<GenericDocument>>> GetDocumentsByKey(string keyName, string keyValue)
        {
            var documents = await _documentIndexService.GetDocumentsByKey(keyName, keyValue);
            return Ok(documents);
        }

        [HttpPost("UpdateDocumentGeneric")]
        public async Task UpdateDocumentGeneric([FromBody] GenericDocument document)
        {
            await _documentIndexService.UpdateDocumentGeneric(document);
        }
    }
}