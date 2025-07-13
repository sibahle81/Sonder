using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimRequirementService : IService
    {
        Task<List<PersonEventClaimRequirement>> GetPersonEventRequirements(int personEventId);
        Task<int> UpdatePersonEventClaimRequirement(PersonEventClaimRequirement personEventClaimRequirement);
        Task<int> UpdatePersonEventClaimRequirements(List<PersonEventClaimRequirement> personEventClaimRequirements);
        Task<int> AddPersonEventClaimRequirement(PersonEventClaimRequirement personEventClaimRequirement);
        Task<int> AddPersonEventClaimRequirements(List<PersonEventClaimRequirement> personEventClaimRequirements);
        Task<List<ClaimRequirementCategoryMapping>> GeneratePersonEventRequirements(ClaimRequirementMapping claimRequirementMapping);
        Task<List<ClaimRequirementCategory>> GetClaimRequirementCategory();
        Task<int> AddClaimRequirement(PersonEventClaimRequirement requirement);
        Task<PersonEventClaimRequirement> GetEventRequirementByClaimRequirementCategoryId(int claimRequirementClaimCategoryId, int personEvent);
        Task<ClaimRequirementCategory> GetClaimRequirementCategoryById(DocumentTypeEnum claimRequirementCategoryId);
        Task<List<ClaimRequirementCategory>> GetClaimRequirementCategoryLinkedToPersonEvent(int personEventId);
        Task<PersonEventClaimRequirement> GetPersonEventRequirementByCategoryId(int personEventId, int categoryId);
        Task<PersonEventClaimRequirement> GetRequirementByDocumentTypeId(int personEventId, DocumentTypeEnum documentTypeId);
        Task StartSection40Workflow(PersonEvent personEvent);
        Task<List<PersonEventClaimRequirement>> GetConfiguredRequirements(PersonEvent personEvent);
        Task<PagedRequestResult<ClaimRequirementCategory>> GetPagedClaimRequirementCategory(ClaimRequirementCategorySearchRequest claimRequirementCategorySearchRequest);
        Task<bool> SendAdhocClaimRequirementCommunication(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest);
        Task<bool> SendAdhocClaimRequirementCommunicationSms(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest);

    }
}