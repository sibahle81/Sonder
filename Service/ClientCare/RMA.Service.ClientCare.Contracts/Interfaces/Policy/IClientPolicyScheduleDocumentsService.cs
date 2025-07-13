using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IClientPolicyScheduleDocumentsService : IService
    {
        Task<OneTimePinModel> GetOneTimePinByPolicyNumber(string policyNumber);
        Task<List<MailAttachment>> GetPolicyDocumentsByPolicyNumber(string policyNumber, int oneTimePin);
        Task<string> GetDocumentPassword(Case caseModel);
    }
}