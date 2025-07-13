using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class DocumentTemplateFacade : RemotingStatelessService, IDocumentTemplateService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_DocumentTemplate> _documentTemplateRepository;
        private readonly IMapper _mapper;

        public DocumentTemplateFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_DocumentTemplate> documentTemplateRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _documentTemplateRepository = documentTemplateRepository;
            _mapper = mapper;
        }

        public async Task<DocumentTemplate> GetDocumentTemplateByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentTemplate = await _documentTemplateRepository
                    .ProjectTo<DocumentTemplate>(_mapper.ConfigurationProvider)
                    .SingleAsync(docTemplate => docTemplate.IsActive
                                                && !docTemplate.IsDeleted
                                                && docTemplate.Name == name,
                        $"Could not find document template with name {name}");

                return documentTemplate;
            }
        }

        public async Task<DocumentTemplate> GetDocumentTemplateByDocumentType(DocumentTypeEnum documentType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _documentTemplateRepository
                     .ProjectTo<DocumentTemplate>(_mapper.ConfigurationProvider)
                     .FirstOrDefaultAsync(docTemplate => docTemplate.IsActive
                                                 && !docTemplate.IsDeleted
                                                 && docTemplate.DocumentHtml != null
                                                 && docTemplate.DocumentType == documentType);

                return template;
            }
        }

        public async Task<DocumentTemplate> GetDocumentTemplateById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentTemplate = await _documentTemplateRepository
                    .ProjectTo<DocumentTemplate>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id,
                        $"Could not find document template with id {id}");

                return documentTemplate;
            }
        }

        public async Task<List<MailAttachment>> GetDocumentTemplateByIds(List<int> documentTypeIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var mailAttachments = await _documentTemplateRepository
                    .ProjectTo<DocumentTemplate>(_mapper.ConfigurationProvider)
                    .Where(a => documentTypeIds.Contains((int)a.DocumentType))
                    .Select(attachment => new MailAttachment()
                    {
                        AttachmentByteData = attachment.DocumentBinary,
                        FileName = attachment.DocumentName,
                        FileType = attachment.DocumentMimeType
                    }).ToListAsync();

                return mailAttachments;
            }
        }

        public async Task<List<DocumentTemplate>> GetDocumentTemplates()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var documentTemplates = await _documentTemplateRepository
                    .Where(documentTemplate => documentTemplate.IsActive && !documentTemplate.IsDeleted)
                    .ProjectTo<DocumentTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return documentTemplates;
            }
        }

        public async Task<DocumentTemplate> GetDocumentTemplateByTemplateId(DocumentTypeEnum documentType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _documentTemplateRepository
                     .ProjectTo<DocumentTemplate>(_mapper.ConfigurationProvider)
                     .FirstOrDefaultAsync(docTemplate => docTemplate.IsActive
                                                 && !docTemplate.IsDeleted
                                                 && docTemplate.DocumentType == documentType);

                return template;
            }
        }

    }
}