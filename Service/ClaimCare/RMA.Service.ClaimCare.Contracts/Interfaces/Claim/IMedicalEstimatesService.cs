using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClaimCare.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IMedicalEstimatesService : IService
    {
        Task<List<Icd10CodeEstimateAmount>> GetICD10Estimates(ICD10EstimateFilter icd10EstimateFilter);
    }
}