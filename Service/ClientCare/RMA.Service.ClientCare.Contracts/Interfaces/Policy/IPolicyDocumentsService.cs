using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyDocumentsService : IService
    {
        Task<List<MailAttachment>> GetFuneralPolicyDocumentsByWizardId(int wizardId);

        Task<List<MailAttachment>> GetFuneralPolicyDocumentsByPolicyId(int policyId, string parentPolicyNumber);
    }
}
