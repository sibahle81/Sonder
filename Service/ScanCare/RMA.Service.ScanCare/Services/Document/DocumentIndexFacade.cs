using AutoMapper;
using RMA.Common.Constants;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.Integrations.Contracts.Entities.BlobStorage;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;
using RMA.Service.ScanCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Security.Policy;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;

namespace RMA.Service.ScanCare.Services.Document
{
    public class DocumentIndexFacade : RemotingStatelessService, IDocumentIndexService
    {
        //Force Recompile (4/15/2025 11:58)--- PLEASE DO NOT REMOVE THIS LINE
        //Force Recompile (06/30/2025 10:00)--- PLEASE DO NOT REMOVE THIS LINE

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IBinaryStorageService _binaryStorageService;
        private readonly IRepository<documents_Document> _documentRepository;
        private readonly IRepository<documents_DocumentType> _documentTypeRepository;
        private readonly IRepository<documents_DocumentKey> _documentKeyRepository;
        private readonly IRepository<documents_DocumentSetDocumentType> _documentSetDocumentTypeRepository;

        private readonly IRepository<documents_DocumentRule> _documentRuleRepository;

        public DocumentIndexFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<documents_Document> docMetaDataRepository,
            IBinaryStorageService binaryStorageService,
            IRepository<documents_DocumentSetDocumentType> documentSetDocumentTypeRepository,
            IRepository<documents_DocumentKey> documentKeyRepository,
            IRepository<documents_DocumentType> documentTypeRepository,
            IRepository<documents_DocumentRule> documentRuleRepository
        )
        : base(context)
        {
            _binaryStorageService = binaryStorageService;
            _documentSetDocumentTypeRepository = documentSetDocumentTypeRepository;
            _documentKeyRepository = documentKeyRepository;
            _documentTypeRepository = documentTypeRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _documentRepository = docMetaDataRepository;
            _documentRuleRepository = documentRuleRepository;
        }

        public async Task<List<DocumentType>> GetDocumentTypeBySetId(DocumentSetEnum documentSet)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var documents = await _documentTypeRepository.Where(z => z.DocumentSetDocumentTypes.Any(a => a.DocumentSet == documentSet)).ToListAsync();
                await _documentTypeRepository.LoadAsync(documents, d => d.DocumentSetDocumentTypes);
                return Mapper.Map<List<Contracts.Entities.DocumentType>>(documents);
            }
        }

        public async Task<List<Contracts.Entities.Document>> GetDocumentsBySetAndKey(DocumentSetEnum documentSet, Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var docTypes = await _documentSetDocumentTypeRepository
                                        .Where(ds => ds.DocumentSet == documentSet)
                                        .Select(d => d.DocumentType).ToListAsync();

                docTypes.RemoveAll(item => item == null);

                var docTypeIds = docTypes.Select(dt => dt.Id).ToList();

                var documents = new List<Contracts.Entities.Document>();

                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();

                var existingDocs = await (from d in _documentKeyRepository
                                          where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                                && docTypeIds.Contains(d.Document.DocTypeId)
                                                && !d.IsDeleted
                                          select d.Document)
                    .Select(b => new Contracts.Entities.Document()
                    {
                        Id = b.Id,
                        DocTypeId = b.DocTypeId,
                        FileExtension = b.FileExtension,
                        DocumentUri = b.DocumentUri,
                        DocumentStatus = b.DocumentStatus,
                        FileName = b.FileName,
                        FileHash = b.FileHash,
                        SystemName = b.SystemName,
                        VerifiedByDate = b.VerifiedByDate.Value,
                        DocumentSet = documentSet,
                        VerifiedBy = b.VerifiedBy,
                        DocumentTypeName = b.DocumentType.Name,
                        CreatedBy = b.CreatedBy,
                        CreatedDate = b.CreatedDate,
                        DocumentDescription = b.DocumentDescription
                    })

                    .ToListAsync();
                documents.AddRange(existingDocs);

                // Get the documents that has not yet been uploaded
                documents.AddRange(docTypes.Where(a => !documents.Select(c => c.DocTypeId).Contains(a.Id)).Select(
                        b => new Contracts.Entities.Document()
                        {
                            DocTypeId = b.Id,
                            DocumentSet = documentSet,
                            DocumentStatus = DocumentStatusEnum.Awaiting,
                            DocumentTypeName = b.Name
                        }));

                // Update the required field.
                var documentSetDocumentType = await _documentSetDocumentTypeRepository
                    .Where(dst => dst.DocumentSet == documentSet)
                    .ToListAsync();
                foreach (var document in documents)
                {
                    var docSetDocType = documentSetDocumentType
                        .FirstOrDefault(dst => dst.DocTypeId == document.DocTypeId);
                    if (docSetDocType != null)
                    {
                        document.Required = docSetDocType.Required;
                    }
                }
                return documents.OrderByDescending(s => s.CreatedDate).ToList();
            }
        }

        public async Task<Contracts.Entities.Document> GetDocumentBinary(int documentId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var document = await _documentRepository.SingleOrDefaultAsync(a => a.Id == documentId);
                if (document == null)
                {
                    throw new KeyNotFoundException($"Document with ID {documentId} not found.");
                }

                await _documentRepository.LoadAsync(document, d => d.DocumentType);

                var documentData = await _binaryStorageService.GetDocument(document.DocumentUri);
                if (documentData == null || documentData.Data == null)
                {
                    throw new InvalidOperationException($"Document data for URI {document.DocumentUri} not found.");
                }

                var fileAsBase64 = Convert.ToBase64String(documentData.Data);

                return new Contracts.Entities.Document()
                {
                    Id = document.Id,
                    FileAsBase64 = fileAsBase64,
                    FileName = document.FileName,
                    DocumentTypeName = document.DocumentType.Name,
                    FileExtension = document.FileExtension,
                    DocumentUri = document.DocumentUri,
                    SystemName = document.SystemName,
                    DocTypeId = document.DocTypeId,
                    DocumentStatus = document.DocumentStatus,
                    MimeType = MimeMapping.GetMimeMapping(document.FileName)
                };
            }
        }

        public async Task<Contracts.Entities.Document> UploadDocument(Contracts.Entities.Document documentUpload)
        {
            if (documentUpload == null) return null;

            var uploadedDocument = new documents_Document();

            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var dataString = Regex.Replace(documentUpload.FileAsBase64, @"^.+?(;base64),", string.Empty);
                    byte[] documentBinary = Convert.FromBase64String(dataString);

                    string hash;
                    using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
                    {
                        hash = Convert.ToBase64String(sha1.ComputeHash(documentBinary));
                    }

                    documents_Document existingDoc = null;
                    if (documentUpload.Keys != null)
                    {
                        var keyData = documentUpload.Keys.Select(k => k.Key + "|" + k.Value).ToList();
                        existingDoc = await (from d in _documentKeyRepository
                                             where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                                   && d.Document.SystemName == documentUpload.SystemName
                                                   && d.Document.DocTypeId == documentUpload.DocTypeId
                                                   && d.Document.FileName == documentUpload.FileName
                                                   && !d.IsDeleted
                                                   || d.Document.FileHash == hash //Check if the same file has already exists
                                             select d.Document).FirstOrDefaultAsync();
                    }


                    var docType = await _documentTypeRepository
                        .SingleOrDefaultAsync(dt => dt.Id == documentUpload.DocTypeId);
                    if (docType == null)
                        throw new Exception($"Document type {documentUpload.DocTypeId} could not be found");
                    var docTypeName = docType.Name;


                    string blobUri;
                    if (existingDoc == null)
                    {
                        // Saving binary to Azure Blob, returning a new URI
                        blobUri = await _binaryStorageService.SaveDocument(new DocumentEntry()
                        {
                            FileName = documentUpload.FileName,
                            Data = documentBinary,
                            DocumentTypeName = docTypeName,
                            DocumentKeys = documentUpload.Keys,
                            SystemName = documentUpload.SystemName
                        });
                    }
                    else
                    {
                        blobUri = existingDoc.DocumentUri;
                    }

                    var document = new documents_Document()
                    {
                        DocTypeId = documentUpload.DocTypeId,
                        SystemName = documentUpload.SystemName,
                        DocumentUri = blobUri,
                        DocumentStatus = documentUpload.DocumentStatus,
                        FileExtension = documentUpload.FileExtension == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            ? "xlsx" :
                            documentUpload.FileExtension == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                ? "docx" :
                                documentUpload.FileExtension,
                        FileName = documentUpload.FileName,
                        FileHash = hash,
                        DocumentDescription = documentUpload.DocumentDescription,
                        IsMemberVisible = documentUpload.IsMemberVisible,
                        DocumentKeys = documentUpload.Keys.Select(d => new documents_DocumentKey()
                        {
                            KeyName = d.Key,
                            KeyValue = d.Value
                        }).ToList(),
                        CreatedBy = RmaIdentity.Username,
                        ModifiedBy = RmaIdentity.Username
                    };

                    uploadedDocument = _documentRepository.Create(document);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
            finally
            {
                documentUpload = null;
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }

            return Mapper.Map<Contracts.Entities.Document>(uploadedDocument);
        }

        public async Task UpdateDocument(Contracts.Entities.Document document)
        {
            if (document == null) return;

            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var result = await _documentRepository.FirstOrDefaultAsync(a => a.Id == document.Id);

                    if (result == null)
                    {
                        return;
                    }

                    await _documentRepository.LoadAsync(result, r => r.DocumentKeys);

                    result.DocumentStatus = document.DocumentStatus;

                    if (document.DocumentStatus == DocumentStatusEnum.Deleted)
                    {
                        result.IsDeleted = true;
                        result.DocumentKeys.ForEach(f => f.IsDeleted = true);
                    }

                    result.IsMemberVisible = document.IsMemberVisible;

                    _documentRepository.Update(result);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
            finally
            {
                document = null;
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }

        public async Task<bool> HaveAllDocumentsBeenAccepted(DocumentSetEnum documentSet, Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();

                var documents = await (from d in _documentKeyRepository
                                       from k in keyData
                                       where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                             && d.Document.DocumentStatus == DocumentStatusEnum.Accepted
                                             && !d.IsDeleted
                                       select d.Document).ToListAsync();
                await _documentRepository.LoadAsync(documents, d => d.DocumentKeys);

                var docSet = await _documentSetDocumentTypeRepository.Where(a => a.DocumentSet == documentSet && a.Required).ToListAsync();

                foreach (var d in docSet)
                {
                    var doc = documents.FirstOrDefault(ds => ds.DocTypeId == d.DocTypeId);
                    if (doc == null)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public async Task<bool> HaveAllDocumentsBeenReceived(DocumentSetEnum documentSet, Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();

                var documents = await (from d in _documentKeyRepository
                                       from k in keyData
                                       where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                             && d.Document.DocumentStatus == DocumentStatusEnum.Received
                                             && !d.IsDeleted
                                       select d.Document).ToListAsync();
                await _documentRepository.LoadAsync(documents, d => d.DocumentKeys);


                var docSet = await _documentSetDocumentTypeRepository.Where(a => a.DocumentSet == documentSet && a.Required).ToListAsync();

                foreach (var d in docSet)
                {
                    var doc = documents.FirstOrDefault(ds => ds.DocTypeId == d.DocTypeId);
                    if (doc == null)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public async Task<bool> HaveUploadedDocuments(DocumentSetEnum documentSet, Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();

                var documents = await (from d in _documentKeyRepository
                                       from k in keyData
                                       where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                             && !d.IsDeleted
                                       select d.Document).ToListAsync();
                await _documentRepository.LoadAsync(documents, d => d.DocumentKeys);


                var docSet = await _documentSetDocumentTypeRepository.Where(a => a.DocumentSet == documentSet && a.Required).ToListAsync();

                foreach (var d in docSet)
                {
                    var doc = documents.FirstOrDefault(ds => ds.DocTypeId == d.DocTypeId);
                    if (doc == null)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public async Task<List<DocumentType>> GetAllDocumentsTypeNotInDocuments(DocumentSetEnum documentSet)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documents = await _documentTypeRepository.Where(z => z.DocumentSetDocumentTypes.All(a => a.DocumentSet != documentSet) && z.Manager == null).ToListAsync();
                return Mapper.Map<List<DocumentType>>(documents);
            }
        }

        public async Task UploadAdditionalDocumentTypes(AdditionalDocument additionalDocument)
        {
            Contract.Requires(additionalDocument != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var documentType in additionalDocument.DocumentTypeIds)
                {
                    var entity = new documents_DocumentSetDocumentType()
                    {
                        DocTypeId = documentType,
                        DocumentSet = additionalDocument.DocumentSet,
                        Required = false,
                        IsDeleted = false

                    };
                    _documentSetDocumentTypeRepository.Create(entity);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<DocumentRule> GetDocumentRule(DeathTypeEnum deathType, bool IsIndividual)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentRule = await _documentRuleRepository.FirstAsync(c => c.DeathType == deathType && c.IsIndividual == IsIndividual);
                return Mapper.Map<DocumentRule>(documentRule);
            }
        }

        public async Task<string> GetDocumentTypeName(int documentTypeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var documentType = await _documentTypeRepository.FirstOrDefaultAsync(a => a.Id == documentTypeId);
                return documentType.Name;
            }
        }

        public async Task<bool> UpdateDocumentKeys(DocumentSystemNameEnum destinationSystem, string oldKeyName, string oldKeyValue, string newKeyName, string newKeyValue)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var documentKeys = await _documentKeyRepository.Where(s => s.KeyName == oldKeyName && s.KeyValue == oldKeyValue).ToListAsync();

                var documentIds = documentKeys.Select(s => s.DocumentId).ToList();
                var documents = await _documentRepository.Where(s => documentIds.Contains(s.Id)).ToListAsync();

                documentKeys.ForEach(documentKey =>
                {
                    documentKey.KeyName = newKeyName;
                    documentKey.KeyValue = newKeyValue;
                });

                documents.ForEach(document =>
                {
                    document.SystemName = Convert.ToString(destinationSystem);
                });

                _documentKeyRepository.Update(documentKeys);
                _documentRepository.Update(documents);

                return (await scope.SaveChangesAsync().ConfigureAwait(false)) > 0;
            }
        }

        public async Task<bool> UpdateDocumentKeyValues(string oldKeyValue, string newKeyValue)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _documentKeyRepository.Where(s => s.KeyValue == oldKeyValue).ToListAsync();
                result.ForEach(d => d.KeyValue = newKeyValue);
                _documentKeyRepository.Update(result);
                return (await scope.SaveChangesAsync().ConfigureAwait(false)) > 0;
            }
        }

        public async Task<List<Contracts.Entities.Document>> GetAllDocumentsNotRecieved(DocumentSetEnum documentSet, Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var docTypes = await _documentSetDocumentTypeRepository
                                        .Where(ds => ds.DocumentSet == documentSet && ds.Required == true)
                                        .Select(d => d.DocumentType).ToListAsync();
                docTypes.RemoveAll(item => item == null);
                var docTypeIds = docTypes.Select(dt => dt.Id).ToList();

                var documents = new List<Contracts.Entities.Document>();
                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();
                var existingDocs = await (from d in _documentKeyRepository
                                          join dk in _documentRepository
                                          on d.DocumentId equals dk.Id
                                          where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                                && docTypeIds.Contains(d.Document.DocTypeId)
                                                && !d.IsDeleted
                                                && dk.DocumentStatus != DocumentStatusEnum.Rejected
                                          select d.Document)
                    .GroupBy(p => p.DocTypeId)
                    .Select(g => g.FirstOrDefault())
                    .Select(b => new Contracts.Entities.Document()
                    {
                        Id = b.Id,
                        DocTypeId = b.DocTypeId,
                        FileExtension = b.FileExtension,
                        DocumentUri = b.DocumentUri,
                        DocumentStatus = b.DocumentStatus,
                        FileName = b.FileName,
                        FileHash = b.FileHash,
                        SystemName = b.SystemName,
                        VerifiedByDate = b.VerifiedByDate.Value,
                        DocumentSet = documentSet,
                        VerifiedBy = b.VerifiedBy,
                        DocumentTypeName = b.DocumentType.Name,
                        CreatedDate = b.CreatedDate
                    }).ToListAsync();
                documents.AddRange(existingDocs);
                documents.AddRange(docTypes.Where(a => !documents.Select(c => c.DocTypeId).Contains(a.Id)).Select(
                        b => new Contracts.Entities.Document()
                        {
                            DocTypeId = b.Id,
                            DocumentSet = documentSet,
                            DocumentStatus = DocumentStatusEnum.Awaiting,
                            DocumentTypeName = b.Name
                        }));

                foreach (var existingDoc in existingDocs)
                {
                    documents.Remove(existingDoc);
                }

                return documents;
            }
        }

        public async Task<List<Contracts.Entities.Document>> GetAllAdditionalDocumentsRecieved(int docTypeId, DocumentSetEnum documentSet, Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documents = new List<Contracts.Entities.Document>();
                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();
                var existingDocs = await (from d in _documentKeyRepository
                                          join dk in _documentRepository
                                          on d.DocumentId equals dk.Id
                                          where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                                && dk.DocTypeId == docTypeId
                                                && !d.IsDeleted
                                                && dk.DocumentStatus != DocumentStatusEnum.Rejected
                                          select d.Document)
                    .GroupBy(p => p.DocTypeId)
                    .Select(g => g.FirstOrDefault())
                    .Select(b => new Contracts.Entities.Document()
                    {
                        Id = b.Id,
                        DocTypeId = b.DocTypeId,
                        FileExtension = b.FileExtension,
                        DocumentUri = b.DocumentUri,
                        DocumentStatus = b.DocumentStatus,
                        FileName = b.FileName,
                        FileHash = b.FileHash,
                        SystemName = b.SystemName,
                        VerifiedByDate = b.VerifiedByDate.Value,
                        DocumentSet = documentSet,
                        VerifiedBy = b.VerifiedBy,
                        DocumentTypeName = b.DocumentType.Name,
                        CreatedDate = b.CreatedDate
                    }).ToListAsync();
                documents.AddRange(existingDocs);

                return documents;
            }
        }

        public async Task<List<int>> GetAllDocumentTypesRecieved(Dictionary<string, string> keys)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();

                var documents = await (from d in _documentKeyRepository
                                       from k in keyData
                                       where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                             && d.Document.DocumentStatus == DocumentStatusEnum.Received
                                             && !d.IsDeleted
                                       select d.Document).ToListAsync();
                documents = documents.Skip(Math.Max(0, documents.Count - 3)).ToList();
                await _documentRepository.LoadAsync(documents, d => d.DocumentKeys);
                return documents.Select(a => a.DocTypeId).ToList();
            }
        }

        public async Task<Common.Entities.MailAttachment> GetDocumentMailAttachment(int documentId)
        {
            if (documentId == 0) return null;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var document = await _documentRepository.SingleOrDefaultAsync(a => a.Id == documentId);

                var documentData = await _binaryStorageService.GetDocument(document.DocumentUri);

                return new Common.Entities.MailAttachment()
                {
                    AttachmentByteData = documentData.Data,
                    FileName = document.FileName,
                    FileType = document.FileExtension,
                    DocumentUri = document.DocumentUri
                };

            }
        }

        public async Task<bool> PolicyScheduleDocumentExists(string policyNumber, DocumentTypeEnum documentType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documents = await (from dk in _documentKeyRepository
                                       join d in _documentRepository
                                          on dk.DocumentId equals d.Id
                                       where dk.KeyName == "CaseCode"
                                          && dk.KeyValue == policyNumber
                                          && d.DocTypeId == (int)documentType
                                       orderby d.Id descending
                                       select d.Id)
                         .ToListAsync();

                if (documents == null)
                {
                    return await Task.FromResult(false);
                }
                return documents.Count > 0;
            }
        }

        public async Task<List<DocumentSetDocumentType>> GetDocumentsTypeByDocumentSet(DocumentSetEnum documentSet)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentSetType = await (from dk in _documentSetDocumentTypeRepository
                                             join d in _documentTypeRepository
                                             on dk.DocTypeId equals d.Id
                                             where dk.DocumentSet == documentSet
                                             orderby d.Name
                                             select new DocumentSetDocumentType()
                                             {
                                                 CreatedBy = dk.CreatedBy,
                                                 DocumentTypeName = d.Name,
                                                 DocumentSet = dk.DocumentSet,
                                                 CreatedDate = dk.CreatedDate,
                                                 DocTypeId = dk.DocTypeId,
                                                 Id = dk.Id,
                                                 IsDeleted = dk.IsDeleted,
                                                 ModifiedBy = dk.ModifiedBy,
                                                 ModifiedDate = dk.ModifiedDate,
                                                 Required = dk.Required,
                                                 StatusEnabled = dk.StatusEnabled,
                                                 TemplateAvailable = dk.TemplateAvailable,
                                             }).ToListAsync();

                var results = Mapper.Map<List<DocumentSetDocumentType>>(documentSetType);

                return results;
            }
        }

        public async Task<List<DocumentSetDocumentType>> GetCombinedDocumentsTypeByDocumentSet(DocumentSetEnum documentSet1, DocumentSetEnum documentSet2)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentSetType1 = await _documentSetDocumentTypeRepository.Where(a => a.DocumentSet == documentSet1).ToListAsync();
                var documentSetType2 = await _documentSetDocumentTypeRepository.Where(a => a.DocumentSet == documentSet2).ToListAsync();

                var newDocumentSetType = documentSetType1.Concat(documentSetType2);
                var results = Mapper.Map<List<DocumentSetDocumentType>>(newDocumentSetType);
                foreach (var documentSetDocumentType in results)
                {
                    documentSetDocumentType.DocumentTypeName =
                        await GetDocumentTypeName(documentSetDocumentType.DocTypeId);
                }
                return results;
            }

        }

        public async Task<Contracts.Entities.Document> GetDocumentById(int documentId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _documentRepository.FirstOrDefaultAsync(d => d.Id == documentId);
                return Mapper.Map<Contracts.Entities.Document>(entity);
            }
        }

        public async Task<PagedRequestResult<GenericDocument>> GetPagedDocumentsByKey(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if(pagedRequest == null) throw new ArgumentNullException(nameof(pagedRequest));
                SqlParameter[] parameters = {
                    new SqlParameter("@PageNumber", pagedRequest.Page),
                    new SqlParameter("@PageSize", pagedRequest.PageSize),
                    new SqlParameter("@SearchCreatia", Convert.ToString(pagedRequest.SearchCriteria))
                };

                var searchResults = await _documentRepository.SqlQueryAsync<GenericDocument>("[documents].[GetPagedDocumentsByKey] @PageNumber, @PageSize, @SearchCreatia", parameters);

                return new PagedRequestResult<GenericDocument>()
                {
                    Page = pagedRequest.Page,
                    PageCount = searchResults.Count / pagedRequest.PageSize,
                    RowCount = searchResults.Count,
                    PageSize = pagedRequest.PageSize,
                    Data = searchResults
                };
            }
        }

        public async Task<List<GenericDocument>> GetDocumentsByKey(string keyName, string keyValue)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("@KeyName", keyName),
                    new SqlParameter("@KeyValue", keyValue),
                };

                return await _documentRepository.SqlQueryAsync<GenericDocument>("[documents].[GetDocumentsByKey] @KeyName, @KeyValue", parameters);
            }
        }

        public async Task UploadDocumentFromCommunication(DocumentSystemNameEnum systemName, DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes, bool isMemberVisible)
        {
            var document = new Contracts.Entities.Document
            {
                DocTypeId = (int)documentType,
                SystemName = systemName.ToString(),
                FileName = fileName,
                Keys = keys,
                DocumentStatus = DocumentStatusEnum.Received,
                FileExtension = fileExtension,
                DocumentSet = documentSet,
                FileAsBase64 = Convert.ToBase64String(documentBytes),
                MimeType = MimeMapping.GetMimeMapping(fileName),
                IsMemberVisible = isMemberVisible
            };
            await UploadDocument(document);
        }

        public async Task UpdateDocumentGeneric(GenericDocument document)
        {
            if (document == null) return;
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    if (document.DocumentStatus == DocumentStatusEnum.Waived)
                    {
                        var documentSetType = await _documentSetDocumentTypeRepository.FirstOrDefaultAsync(a => a.DocumentSet == document.DocumentSet && a.DocumentType.Id == (int)document.DocumentType);
                        documentSetType.Required = false;
                        _documentSetDocumentTypeRepository.Update(documentSetType);
                    }
                    else
                    {
                        var result = await _documentRepository.FirstOrDefaultAsync(a => a.Id == document.Id);
                        if (result == null)
                        {
                            return;
                        }
                        await _documentRepository.LoadAsync(result, r => r.DocumentKeys);

                        if (document != null)
                        {
                            result.DocumentStatus = document.DocumentStatus;

                            if (document.DocumentStatus == DocumentStatusEnum.Deleted)
                            {
                                result.IsDeleted = true;
                                result.DocumentKeys.ForEach(f =>
                                {
                                    f.IsDeleted = true;
                                });
                            }
                        }
                        _documentRepository.Update(result);
                    }
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
            finally
            {
                document = null;
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }

        public async Task<List<Contracts.Entities.Document>> GetReceivedDocumentsBinaryByDocumentType(DocumentTypeEnum documentType)
        {
            var documentList = new List<Contracts.Entities.Document>();

            using (_dbContextScopeFactory.Create())
            {
                var documents = await _documentRepository.Where(a => a.DocTypeId == (int)documentType && a.DocumentStatus == DocumentStatusEnum.Received).ToListAsync();

                foreach (var document in documents)
                {
                    var documentData = await _binaryStorageService.GetDocument(document.DocumentUri);
                    var fileAsBase64 = Convert.ToBase64String(documentData.Data);

                    var doc = new Contracts.Entities.Document()
                    {
                        Id = document.Id,
                        FileAsBase64 = fileAsBase64,
                        FileName = document.FileName,
                        DocumentTypeName = documentType.DisplayDescriptionAttributeValue(),
                        FileExtension = document.FileExtension,
                        DocumentUri = document.DocumentUri,
                        SystemName = document.SystemName,
                        DocTypeId = (int)documentType,
                        DocumentStatus = document.DocumentStatus,
                        MimeType = MimeMapping.GetMimeMapping(document.FileName)
                    };
                    documentList.Add(doc);
                }
            }
            return documentList;
        }

        public async Task<Contracts.Entities.Document> GetDocumentBinaryByKeyValueDocTypeId(string keyName, string keyValue, DocumentTypeEnum documentTypeId)
        {
            Contracts.Entities.Document document = null;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentId = await (from dk in _documentKeyRepository
                                        join d in _documentRepository
                                           on dk.DocumentId equals d.Id
                                        where dk.KeyName == keyName
                                           && dk.KeyValue == keyValue
                                           && d.DocTypeId == (int)documentTypeId
                                        orderby d.Id descending
                                        select d.Id)
                         .FirstOrDefaultAsync();

                if (documentId > 0)
                {
                    return await GetDocumentBinary(documentId);
                }

            }

            return await Task.FromResult(document);
        }

        public async Task<List<Contracts.Entities.DocumentType>> GetAllDocumentsType()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimRequirement = await _documentTypeRepository.OrderBy(u => u.Name).ToListAsync();

                return Mapper.Map<List<Contracts.Entities.DocumentType>>(claimRequirement);
            }
        }

        public async Task<Contracts.Entities.Document> GetDocumentByKeyValueDocTypeId(Dictionary<string, string> keys, DocumentTypeEnum documentType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var keyData = keys.Select(k => k.Key + "|" + k.Value).ToList();
                var document = await (from d in _documentKeyRepository
                                      where keyData.Contains(d.KeyName + "|" + d.KeyValue)
                                            && d.Document.DocTypeId == (int)documentType
                                      select d.Document)
                    .Select(b => new Contracts.Entities.Document()
                    {
                        Id = b.Id,
                        DocTypeId = b.DocTypeId,
                        FileExtension = b.FileExtension,
                        DocumentUri = b.DocumentUri,
                        DocumentStatus = b.DocumentStatus,
                        FileName = b.FileName,
                        FileHash = b.FileHash,
                        SystemName = b.SystemName,
                        VerifiedByDate = b.VerifiedByDate.Value,
                        VerifiedBy = b.VerifiedBy,
                        DocumentTypeName = b.DocumentType.Name,
                        CreatedBy = b.CreatedBy,
                        CreatedDate = b.CreatedDate,
                        DocumentDescription = b.DocumentDescription
                    })
                    .OrderByDescending(d => d.Id)
                    .FirstOrDefaultAsync();
                return Mapper.Map<Contracts.Entities.Document>(document);
            }
        }

        public async Task<Contracts.Entities.Document> AddDocumentDetailsWithoutBinary(Contracts.Entities.Document document)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (document == null) throw new ArgumentNullException(nameof(document));
                if (document.Keys != null)
                {
                    var newDocument = new documents_Document()
                    {
                        DocTypeId = document.DocTypeId,
                        SystemName = document.SystemName,
                        DocumentUri = document.DocumentUri,
                        DocumentStatus = document.DocumentStatus,
                        FileExtension = document.FileExtension,
                        FileName = document.FileName,
                        FileHash = document.FileHash,
                        DocumentDescription = document.DocumentDescription,
                        DocumentKeys = document.Keys.Select(d => new documents_DocumentKey()
                        {
                            KeyName = d.Key,
                            KeyValue = d.Value
                        }).ToList(),
                        CreatedBy = document.CreatedBy,
                    };

                    var entityResult = _documentRepository.Create(newDocument);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    document.Id = entityResult.Id;
                }
            }
            return document;
        }

        /// <summary>
        /// Relinks an already-uploaded blob so that its virtual path contains the
        /// primary identifier, writes that identifier into the blob metadata, and
        /// inserts a lightweight <c>documents_Document</c> row.  
        /// A SHA-1 hash of the binary is also stored in the DB entry.
        /// </summary>
        public async Task<Contracts.Entities.Document> LinkExistingBlob(
            string blobUri,
            string systemName,
            int docTypeId,
            string fileName,
            string fileExtension,
            string identifierKey,
            string identifierValue,
            DocumentStatusEnum status)
        {
            // Path / metadata
            var fileOnly = Path.GetFileName(new Uri(blobUri).LocalPath);
            var newPath = $"{systemName}/{identifierValue}/{fileOnly}";
            if (blobUri == null) throw new ArgumentNullException(nameof(blobUri));
            var alreadyInFolder =
                blobUri.IndexOf("/" + identifierValue + "/", StringComparison.OrdinalIgnoreCase) >= 0;

            if (!alreadyInFolder)
            {
                blobUri = await _binaryStorageService.MoveBlobAsync(
                              blobUri,
                              newPath,
                              new Dictionary<string, string> { { identifierKey, identifierValue } })
                              .ConfigureAwait(false);
            }

            // Compute SHA-1 hash once
            string sha1Hash;
            {
                var blob = await _binaryStorageService.GetDocument(blobUri).ConfigureAwait(false);
                using (var sha1 = SHA1.Create())
                {
                    sha1Hash = Convert.ToBase64String(sha1.ComputeHash(blob.Data));
                }
            }

            // Insert DB row
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = new documents_Document
                {
                    DocTypeId = docTypeId,
                    SystemName = systemName,
                    DocumentUri = blobUri,
                    DocumentStatus = status,
                    FileExtension = fileExtension == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? "xlsx" :
                        fileExtension == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? "docx" :
                            fileExtension,
                    FileName = fileName,
                    FileHash = sha1Hash,
                    IsMemberVisible = false,
                    DocumentKeys = new List<documents_DocumentKey>
                    {
                        new documents_DocumentKey
                        {
                            KeyName = identifierKey,
                            KeyValue = identifierValue
                        }
                    },
                    CreatedBy = SystemSettings.SystemUserAccount,
                    ModifiedBy = SystemSettings.SystemUserAccount
                };

                var created = _documentRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return Mapper.Map<Contracts.Entities.Document>(created);
            }
        }
    }
}