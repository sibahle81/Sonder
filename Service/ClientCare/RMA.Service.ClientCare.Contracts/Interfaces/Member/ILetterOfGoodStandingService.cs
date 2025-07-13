using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Member;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Member
{
    public interface ILetterOfGoodStandingService : IService
    {
        Task<LetterOfGoodStanding> GetLetterOfGoodStanding(int letterOfGoodStandingId);
        Task<Common.Entities.DatabaseQuery.PagedRequestResult<LetterOfGoodStanding>> GetPagedLetterOfGoodStanding(Common.Entities.DatabaseQuery.PagedRequest request);
        Task<bool> GenerateLetterOfGoodStanding(DateTime expiryDate, int rolePlayerId, int policyId);
        Task<bool> GenerateLetterOfGoodStandingForDates(DateTime startDate, DateTime expiryDate, int rolePlayerId, int policyId);
        Task ExpireLettersOfGoodStanding(int rolePlayerId, DateTime effectiveDate);
        Task<bool> ValidateLetterOfGoodStanding(string CertificateNo);
        Task<int> ResendLetterOfGoodStanding(Entities.Policy.Policy policy);
        Task GenerateNextLetterOfGoodStanding(string invoiceNumber);
    }
}
