using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface ITargetAudienceService : IService
    {
        Task<ImportFile> FindOrCreateImportFile(int campaignId, Guid token);
        Task<List<TargetAudience>> GetTargetAudiences(int campaignId);
        Task<List<TargetAudience>> GetTargetAudienceByCampaignId(int campaignId);
        Task<TargetAudience> GetTargetAudience(int campaignId, string itemType, int itemId);
        Task<List<TargetPerson>> GetTargetPersons(List<int> personIds);
        Task<List<TargetCompany>> GetTargetCompanies(List<int> companyIds);
        Task<int> ImportAudience(ImportRequest request, ImportFile importFile);
        Task<int> AddCompanyTargetAudience(int campaignId, TargetCompany targetCompany);
        Task<List<int>> AddTargetAudienceByList(List<TargetAudience> audiences);
        Task<int> AddTargetAudience(TargetAudience audience);
        Task EditTargetAudience(TargetAudience audience);
        Task RemoveTargetAudience(int id);
        Task ModifyTargetAudiences(int campaignId, List<TargetAudience> audiences);
        Task CopyTargetAudience(int campaignId, int newCampaignId);
        Task<int> AddPersonTargetAudience(int campaignId, TargetPerson targetPerson);
    }
}