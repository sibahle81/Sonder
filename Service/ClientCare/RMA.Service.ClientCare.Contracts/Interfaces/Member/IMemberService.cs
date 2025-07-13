using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Member
{
    public interface IMemberService : IService
    {
        Task<int> CreateMember(Roleplayer rolePlayer);
        Task UpdateMember(Roleplayer rolePlayer);
        Task<Roleplayer> GetMemberById(int id);
        Task<PagedRequestResult<MemberSearch>> GetPagedMembers(PagedRequest request);
        Task<List<Company>> GetCompaniesByCompanyLevel(CompanyLevelEnum companyLevel);
        Task<List<Company>> GetSubsidiaries(int roleplayerId);
        Task<string> GenerateMemberNumber(string memberName);
        Task<List<User>> SearchAccountExecutive(string query);
        Task<List<Company>> GetCompaniesByNameOrNumber(string searchCriteria);
        Task<List<NatureOfBusiness>> GetNatureOfBusiness();
        Task<CancelMemberSummary> MemberBulkCancel(FileContentImport content);
        Task<List<IndustryClassRenewal>> GetIndustryClassRenewals();
        Task ManageIndustryClassRenewals(List<IndustryClassRenewal> industryClassRenewals);
        Task SendRenewalLetters(List<IndustryClassEnum> industryClassEnums);
        Task<PagedRequestResult<EmailAudit>> GetPagedEmailAudit(PagedRequest request, string itemType, DateTime startDate);
        Task ResendRenewalLetters(List<RolePlayerContact> rolePlayerContacts);
        Task<List<Roleplayer>> GetMembersByIndustryClass(IndustryClassEnum industryClassEnum);
        Task RemoveContactInformation(int id);
        Task<PagedRequestResult<Company>> GetPagedCompanies(int companyLevelId, int rolePlayerId, PagedRequest request);
        Task<PagedRequestResult<Person>> GetPagedPersons(PagedRequest request);
        Task<List<LinkedUserMember>> GetLinkedUserMembers(int userId);
        Task<PagedRequestResult<LinkedUserMember>> GetPagedLinkedUserMembers(PagedRequest request);
        Task<PagedRequestResult<Roleplayer>> SearchMembers(int industryClassId, int clientTypeId, PagedRequest pagedRequest);
        Task<Company> GetMemberCompanyByRegistrationNumber(string registrationNumber);
        Task<Company> GetMemberCompanyByCFReferenceNumber(string cfReferenceNumber);
        Task<Company> GetMemberCompanyByCFRegistrationNumber(string cfRegistrationNumber);
        Task<PagedRequestResult<PersonEmployment>> GetPagedEmployees(EmployeeSearchRequest employeeSearchRequest);
    }
}
