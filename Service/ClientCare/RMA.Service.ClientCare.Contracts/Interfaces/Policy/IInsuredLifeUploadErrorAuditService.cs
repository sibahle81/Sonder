using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IInsuredLifeUploadErrorAuditService : IService
    {
        Task<List<InsuredLifeErrorAudit>> GetInsuredLivesErrorAudits(string fileIdentifier);
        Task<InsuredLifeErrorAudit> GetInsuredLifeErrorAuditById(int id);
        Task<int> AddInsuredLifeErrorAudit(InsuredLifeErrorAudit insuredLifeErrorAudit);
        Task EditInsuredLifeErrorAudit(InsuredLifeErrorAudit insuredLifeErrorAudit);
    }
}
