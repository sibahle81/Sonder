using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IAgeAnalysisService : IService
    {
        Task<List<AgeAnalysis>> GetAgeAnalysis(AgeAnalysisRequest ageAnalysisRequest);
        Task<List<AgeAnalysis>> GetRecoveryAgeAnalysis(AgeAnalysisRequest ageAnalysisRequest);
        Task<int> AssignCollectionAgent(CollectionAgent collectionAgent);
        Task ClearCollectionAgents(CollectionAgent collectionAgent);
        Task<AgeAnalysisNote> SaveNote(AgeAnalysisNote note);
        Task<int> ImportCollectionAgents(string fileContent);
    }
}
