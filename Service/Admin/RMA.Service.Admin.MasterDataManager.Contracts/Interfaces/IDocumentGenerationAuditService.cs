﻿using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IDocumentGenerationAuditService : IService
    {
        Task<int> AddAudit(DocumentGeneratorAudit audit);
    }
}
