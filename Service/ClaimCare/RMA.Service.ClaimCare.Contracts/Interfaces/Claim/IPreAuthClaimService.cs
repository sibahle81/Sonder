using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IPreAuthClaimService : IService
    {
        Task<PreAuthClaim> GetPreAuthClaimDetail(string claimReferenceNumber);
        Task<PreAuthClaim> GetPreAuthClaimDetailByClaimId(int claimId);
        Task<PreAuthClaim> GetPreAuthClaimDetailByPersonEventId(int personEventId);
        Task<List<Injury>> GetPreAuthClaimInjury(int personEventId);
        Task<List<Injury>> GetPreAuthClaimSecondaryInjuries(int personEventId);
        Task<string> GetClaimReferenceNumberByPersonEventId(int personEventId);
        Task<int> GetPersonEventIdByClaimReferenceNumber(string claimReferenceNumber);
        Task<bool> CheckIfMedicalBenifitExists(int claimId);
        Task<ClaimLiabilityStatusEnum> GetClaimLiabilityStatus(int personEventId);
        Task<string> GetMedicalBenefitTwoYearRuleData(int claimId, DateTime preAuthFromDate);
    }
}
