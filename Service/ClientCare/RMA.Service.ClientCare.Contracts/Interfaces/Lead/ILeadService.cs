using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Lead;

using System.Collections.Generic;
using System.Threading.Tasks;

using LeadModel = RMA.Service.ClientCare.Contracts.Entities.Lead.Lead;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Lead
{
    public interface ILeadService : IService
    {
        Task<LeadModel> GetLead(int leadId);
        Task<LeadModel> GetLeadByRolePlayerId(int rolePlayerId);
        Task<List<LeadModel>> GetLeads();
        Task<LeadModel> CreateNewLead(LeadModel leadModel);
        Task<List<LeadModel>> CreatLeads(List<LeadModel> leads);
        Task<List<LeadModel>> BulkLeadUpload(List<LeadModel> leads);
        Task<bool> UpdateLead(LeadModel leadModel);
        Task<LeadPerson> GetLeadPersonByIdNumber(string idNumber);
        Task<LeadCompany> GetLeadCompanyByRegistrationNumber(string registrationNumber);
        Task<LeadCompany> GetLeadCompanyByCFReferenceNumber(string cfReferenceNumber);
        Task<LeadCompany> GetLeadCompanyByCFRegistrationNumber(string cfRegistrationNumber);
        Task<PagedRequestResult<LeadModel>> GetPagedLeadsBasic(int leadStatusId, PagedRequest pagedRequest);
        Task<PagedRequestResult<LeadNote>> GetPagedLeadNotes(PagedRequest pagedRequest);
        Task<int> AddLeadNote(LeadNote leadNote);
        Task EditLeadNote(LeadNote leadNote);
        Task<PagedRequestResult<LeadContactV2>> GetPagedLeadContactsV2(PagedRequest pagedRequest);
        Task<int> AddLeadContactV2(LeadContactV2 leadContactV2);
        Task EditLeadContactV2(LeadContactV2 leadContactV2);
        Task<PagedRequestResult<LeadAddress>> GetPagedLeadAddresses(PagedRequest pagedRequest);
        Task<int> AddLeadAddress(LeadAddress leadAddress);
        Task EditLeadAddress(LeadAddress leadAddress);
    }
}