using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPremiumListingErrorAuditService : IService
    {
        Task<List<PremiumListingErrorAudit>> GetPremiumListingErrorAudits(string fileIdentifier);
        Task<PremiumListingErrorAudit> GetPremiumListingErrorAudit(int id);
        Task<int> AddPremiumListingErrorAudit(PremiumListingErrorAudit premiumListingErrorAudit);
        Task EditPremiumListingErrorAudit(PremiumListingErrorAudit premiumListingErrorAudit);
    }
}
