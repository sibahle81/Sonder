using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IDocumentTemplateService : IService
    {
        Task<DocumentTemplate> GetDocumentTemplateByName(string name);
        Task<DocumentTemplate> GetDocumentTemplateById(int id);
        Task<List<DocumentTemplate>> GetDocumentTemplates();
        Task<DocumentTemplate> GetDocumentTemplateByDocumentType(DocumentTypeEnum documentType);
        Task<List<MailAttachment>> GetDocumentTemplateByIds(List<int> documentTypeIds);
        Task<DocumentTemplate> GetDocumentTemplateByTemplateId(DocumentTypeEnum documentType);
    }
}