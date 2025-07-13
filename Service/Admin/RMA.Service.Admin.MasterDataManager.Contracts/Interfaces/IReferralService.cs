using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IReferralService : IService
    {
        Task<Referral> CreateReferral(Referral referral);
        Task<Referral> GetReferral(int referralId);
        Task<Referral> UpdateReferral(Referral referral);
        Task<ReferralNatureOfQuery> UpdateReferralNatureOfQuery(ReferralNatureOfQuery referralNatureOfQuery);
        Task<PagedRequestResult<Referral>> GetPagedReferrals(ReferralSearchRequest referralSearchRequest);
        Task<List<ReferralNatureOfQuery>> GetReferralNatureOfQuery();
        Task<PagedRequestResult<ReferralNatureOfQuery>> GetPagedReferralNatureOfQuery(ReferralSearchRequest referralSearchRequest);
    }
}