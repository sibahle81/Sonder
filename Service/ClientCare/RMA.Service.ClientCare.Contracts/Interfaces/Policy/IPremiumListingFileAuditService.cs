using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPremiumListingFileAuditService : IService
    {
        Task<List<PremiumListingFileAudit>> GetPremiumListingFileAudits();
        Task<PremiumListingFileAudit> GetPremiumListingFileAudit(int id);
        Task<int> AddPremiumListingFileAudit(PremiumListingFileAudit premiumListingFileAudit);
        Task EditPremiumListingFileAudit(PremiumListingFileAudit premiumListingFileAudit);
        Task UpdatePremiumListingStatusByFileIdentifier(string fileIdentifier, PremiumListingStatusEnum status);
        Task<int> BrokerImportPremiumListing(FileContentImport content);
        Task<List<PremiumListingFileAudit>> GetPremiumListingFileAuditsByBrokerEmail(string email);
        Task<string> GetPolicyNumber(Guid fileIdentifier);
    }
}
