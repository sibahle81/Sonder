using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyDocumentService : IService
    {
        Task<bool> CreatePolicyWelcomePack(string policyNumber);
        Task<int> RefreshPolicyDocument(string policyNumber, DocumentTypeEnum documentType, DocumentRefreshReasonEnum? documentRefreshReason);
        Task SendPolicyWelcomePack(string policyNumber);
        Task SendPolicyDocument(string policyNumber, DocumentTypeEnum documentType);

        Task<PolicyDocumentCommunicationMatrix> GetPolicyDocumentCommunicationMatrix(int? policyId);
        Task<bool> SendPolicyDocuments(int policyId, string policyCommunicationType);
        Task<bool> SendDocumentsToScheme(int policyId, string policyCommunicationType);
        Task<bool> SendDocumentsToBroker(int policyId, string policyCommunicationType);
        Task<bool> SendDocumentsToAdmin(int policyId, string policyCommunicationType);
        Task<bool> SendDocumentsToMember(int policyId, string policyCommunicationType);

        Task<bool> SendUnfullfilledCommunications();
        Task<bool> SendUnfullfilledOnceOffCommunications();
        Task<bool> SendUnfullfilledSchemeCommunications();
        Task<bool> SendUnfullfilledOnceOffSchemeCommunications();
    }
}
