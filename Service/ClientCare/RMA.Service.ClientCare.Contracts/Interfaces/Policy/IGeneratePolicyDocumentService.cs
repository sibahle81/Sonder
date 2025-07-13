using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IGeneratePolicyDocumentService : IService
    {
        Task CreatePolicyDocumentsIfNotExists(PolicyModel policy, string parentPolicyNumber);
        Task CreatePolicyShedulesOnly(PolicyModel policy);
        Task CreatePolicyCancellationLetter(PolicyMinimumData policy);
       
    }
}

