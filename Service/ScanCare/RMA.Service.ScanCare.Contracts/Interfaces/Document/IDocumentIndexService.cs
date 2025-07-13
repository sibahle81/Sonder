using System;
using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ScanCare.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;


namespace RMA.Service.ScanCare.Contracts.Interfaces.Document
{
    public interface IDocumentIndexService : IService
    {
        Task<List<Contracts.Entities.DocumentType>> GetDocumentTypeBySetId(DocumentSetEnum documentSet);
        Task<List<Entities.Document>> GetDocumentsBySetAndKey(DocumentSetEnum documentSet, Dictionary<string, string> keys);
        Task<Contracts.Entities.Document> GetDocumentBinary(int documentId);
        Task<Entities.Document> UploadDocument(Entities.Document upload);
        Task UpdateDocument(Entities.Document document);
        Task UpdateDocumentGeneric(GenericDocument document);
        Task<bool> HaveAllDocumentsBeenAccepted(DocumentSetEnum documentSet, Dictionary<string, string> keys);
        Task<bool> HaveAllDocumentsBeenReceived(DocumentSetEnum documentSet, Dictionary<string, string> keys);
        Task<List<Contracts.Entities.DocumentType>> GetAllDocumentsTypeNotInDocuments(DocumentSetEnum documentSet);
        Task UploadAdditionalDocumentTypes(AdditionalDocument additionalDocument);
        Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue);
        Task<DocumentRule> GetDocumentRule(DeathTypeEnum deathType, bool IsIndividual);
        Task<string> GetDocumentTypeName(int documentTypeId);
        Task<List<Contracts.Entities.Document>> GetAllDocumentsNotRecieved(DocumentSetEnum documentSet, Dictionary<string, string> keys);
        Task<MailAttachment> GetDocumentMailAttachment(int documentId);
        Task<List<int>> GetAllDocumentTypesRecieved(Dictionary<string, string> keys);
        Task<bool> PolicyScheduleDocumentExists(string policyNumber, DocumentTypeEnum documentType);
        Task<List<DocumentSetDocumentType>> GetDocumentsTypeByDocumentSet(DocumentSetEnum documentSet);
        Task<List<DocumentSetDocumentType>> GetCombinedDocumentsTypeByDocumentSet(DocumentSetEnum documentSet1, DocumentSetEnum documentSet2);
        Task<bool> HaveUploadedDocuments(DocumentSetEnum documentSet, Dictionary<string, string> keys);
        Task<Entities.Document> GetDocumentById(int documentId);
        Task<PagedRequestResult<GenericDocument>> GetPagedDocumentsByKey(PagedRequest pagedRequest);
        Task<List<GenericDocument>> GetDocumentsByKey(string keyName, string keyValue);
        Task<bool> UpdateDocumentKeys(DocumentSystemNameEnum destinationSystem, string oldKeyName, string oldKeyValue, string newKeyName, string newKeyValue);
        Task UploadDocumentFromCommunication(DocumentSystemNameEnum systemName, DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes, bool isMemberVisible);
        Task<List<Contracts.Entities.Document>> GetReceivedDocumentsBinaryByDocumentType(DocumentTypeEnum documentType);
        Task<Contracts.Entities.Document> GetDocumentBinaryByKeyValueDocTypeId(string keyName, string keyValue, DocumentTypeEnum documentTypeId);
        Task<List<Contracts.Entities.Document>> GetAllAdditionalDocumentsRecieved(int docTypeId, DocumentSetEnum documentSet, Dictionary<string, string> keys);
        Task<Contracts.Entities.Document> GetDocumentByKeyValueDocTypeId(Dictionary<string, string> keys, DocumentTypeEnum documentType);
        Task<Contracts.Entities.Document> AddDocumentDetailsWithoutBinary(Contracts.Entities.Document document);

        Task<Contracts.Entities.Document> LinkExistingBlob(
            string blobUri,
            string systemName,
            int docTypeId,
            string fileName,
            string fileExtension,
            string identifierKey,
            string identifierValue,
            DocumentStatusEnum status);
    }
}
