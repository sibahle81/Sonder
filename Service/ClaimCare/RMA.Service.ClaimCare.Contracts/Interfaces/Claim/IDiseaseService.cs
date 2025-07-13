using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClaimCare.Contracts.Entities;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IDiseaseService : IService
    {
        Task<Entities.Claim> GetDiseaseClaim(int ClaimId);
        Task<string> GenerateClaimNumber(PersonEvent personEvent, DateTime eventDate, int count);
        Task AutoAcknowledgeDiseaseClaim();
        Task SaveFirstMedicalReport(PersonEvent personEvent);
    }
}