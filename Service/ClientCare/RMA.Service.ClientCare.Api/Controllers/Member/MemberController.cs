using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using RolePlayerModel = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Api.Controllers.Member
{
    [Route("api/Member/[controller]")]

    public class MemberController : RmaApiController
    {
        private readonly IMemberService _memberService;
        private readonly IRolePlayerNoteService _rolePlayerNoteService;

        public MemberController(IMemberService memberService, IRolePlayerNoteService rolePlayerNoteService)
        {
            _memberService = memberService;
            _rolePlayerNoteService = rolePlayerNoteService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Contracts.Entities.RolePlayer.RolePlayer>> Get(int id)
        {
            var rolePlayer = await _memberService.GetMemberById(id);
            return Ok(rolePlayer);
        }

        [HttpGet("GenerateMemberNumber/{memberName}")]
        public async Task<ActionResult<string>> GenerateMemberNumber(string memberName)
        {
            var memberNumber = await _memberService.GenerateMemberNumber(memberName);
            return Ok(memberNumber);
        }

        [HttpGet("GetCompaniesByCompanyLevel/{companyLevel}")]
        public async Task<ActionResult<List<Company>>> GetCompaniesByCompanyLevel(CompanyLevelEnum companyLevel)
        {
            var companies = await _memberService.GetCompaniesByCompanyLevel(companyLevel);
            return Ok(companies);
        }

        [HttpGet("GetSubsidiaries/{roleplayerId}")]
        public async Task<ActionResult<List<Company>>> GetSubsidiaries(int roleplayerId)
        {
            var companies = await _memberService.GetSubsidiaries(roleplayerId);
            return Ok(companies);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Contracts.Entities.RolePlayer.RolePlayer rolePlayer)
        {
            var memberId = await _memberService.CreateMember(rolePlayer);
            return Ok(memberId);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<MemberSearch>>> SearchMembers(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var members = await _memberService.GetPagedMembers(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(members);
        }

        [HttpGet("SearchAccountExecutive/{query}")]
        public async Task<ActionResult<List<User>>> SearchAccountExecutive(string query)
        {
            var users = await _memberService.SearchAccountExecutive(query);
            return Ok(users);
        }

        [HttpGet("GetCompaniesByNameOrNumber/{searchCriteria}")]
        public async Task<ActionResult<List<Company>>> GetCompaniesByNameOrNumber(string searchCriteria)
        {
            var companies = await _memberService.GetCompaniesByNameOrNumber(searchCriteria);
            return Ok(companies);
        }

        [HttpGet("GetNatureOfBusinesses")]
        public async Task<ActionResult<List<NatureOfBusiness>>> GetNatureOfBusinesses()
        {
            var natureOfBusinesses = await _memberService.GetNatureOfBusiness();
            return Ok(natureOfBusinesses);
        }

        [HttpPost("MemberBulkCancel")]
        public async Task<ActionResult<CancelMemberSummary>> MemberBulkCancel([FromBody] FileContentImport content)
        {
            var result = await _memberService.MemberBulkCancel(content);
            return Ok(result);
        }

        [HttpGet("GetIndustryClassRenewals")]
        public async Task<ActionResult<List<IndustryClassRenewal>>> GetIndustryClassRenewals()
        {
            var industryClassRenewals = await _memberService.GetIndustryClassRenewals();
            return Ok(industryClassRenewals);
        }

        [HttpGet("GetPagedEmailAudit/{itemType}/{startDate}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<EmailAudit>>> GetPagedEmailAudit(string itemType, DateTime startDate, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var members = await _memberService.GetPagedEmailAudit(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), itemType, startDate);
            return Ok(members);
        }

        [HttpPut("ResendRenewalLetter")]
        public async Task<ActionResult> ResendRenewalLetter([FromBody] MemberResendEmailRequest memberResendEmailRequest)
        {
            var rolePlayerContacts = memberResendEmailRequest?.RolePlayerContacts;

            await _memberService.ResendRenewalLetters(rolePlayerContacts);
            return Ok();
        }

        [HttpPut("UpdateMember")]
        public async Task<ActionResult<bool>> UpdateMember([FromBody] RolePlayerModel rolePlayer)
        {
            await _memberService.UpdateMember(rolePlayer);
            return Ok(true);
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _memberService.RemoveContactInformation(id);
            return Ok();
        }

        [HttpGet("GetPagedCompanies/{companyLevelId}/{rolePlayerId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Company>>> GetPagedCompanies(int companyLevelId, int rolePlayerId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var results = await _memberService.GetPagedCompanies(companyLevelId, rolePlayerId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("GetPagedPersons/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Person>>> GetPagedPersons(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var members = await _memberService.GetPagedPersons(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(members);
        }

        [HttpGet("GetLinkedUserMembers/{userId}")]
        public async Task<ActionResult<List<LinkedUserMember>>> GetLinkedUserMembers(int userId)
        {
            var linkedMembers = await _memberService.GetLinkedUserMembers(userId);
            return Ok(linkedMembers);
        }

        [HttpGet("GetPagedLinkedUserMembers/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LinkedUserMember>>> GetPagedLinkedUserMembers(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var linkedMembers = await _memberService.GetPagedLinkedUserMembers(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(linkedMembers);
        }

        [HttpPost("AddRolePlayerNote")]
        public async Task<ActionResult<int>> AddRolePlayerNote([FromBody] RolePlayerNote rolePlayerNote)
        {
            var id = await _rolePlayerNoteService.AddRolePlayerNote(rolePlayerNote);
            return Ok(id);
        }

        [HttpPut("EditRolePlayerNote")]
        public async Task<ActionResult> EditRolePlayerNote([FromBody] RolePlayerNote rolePlayerNote)
        {
            await _rolePlayerNoteService.EditRolePlayerNote(rolePlayerNote);
            return Ok();
        }

        [HttpGet("GetPagedRolePlayerNotes/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyGroupMember>>> GetPagedRolePlayerNotes(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var rolePlayerNotes = await _rolePlayerNoteService.GetPagedRolePlayerNotes(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(rolePlayerNotes);
        }

        [HttpGet("SearchMembers/{industryClassId}/{clientTypeId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerModel>>> SearchMembers(int industryClassId, int clientTypeId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var members = await _memberService.SearchMembers(industryClassId, clientTypeId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(members);
        }

        [HttpGet("GetMemberCompanyByRegistrationNumber/{registrationNumber}")]
        public async Task<ActionResult<Company>> GetMemberCompanyByRegistrationNumber(string registrationNumber)
        {
            var company = await _memberService.GetMemberCompanyByRegistrationNumber(registrationNumber);
            return Ok(company);
        }

        [HttpGet("GetMemberCompanyByCFReferenceNumber/{cfReferenceNumber}")]
        public async Task<ActionResult<Company>> GetMemberCompanyByCFReferenceNumber(string cfReferenceNumber)
        {
            var company = await _memberService.GetMemberCompanyByCFReferenceNumber(cfReferenceNumber);
            return Ok(company);
        }

        [HttpGet("GetMemberCompanyByCFRegistrationNumber/{cfRegistrationNumber}")]
        public async Task<ActionResult<Company>> GetMemberCompanyByCFRegistrationNumber(string cfRegistrationNumber)
        {
            var company = await _memberService.GetMemberCompanyByCFRegistrationNumber(cfRegistrationNumber);
            return Ok(company);
        }

        [HttpPost("GetPagedEmployees")]
        public async Task<ActionResult<PagedRequestResult<Referral>>> GetPagedEmployees([FromBody] EmployeeSearchRequest employeeSearchRequest)
        {
            var results = await _memberService.GetPagedEmployees(employeeSearchRequest);
            return Ok(results);
        }
    }
}