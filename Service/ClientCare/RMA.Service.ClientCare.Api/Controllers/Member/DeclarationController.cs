using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.Member
{
    [Route("api/Member/[controller]")]
    public class DeclarationController : RmaApiController
    {
        private readonly IDeclarationService _declarationService;

        public DeclarationController(IDeclarationService declarationService)
        {
            _declarationService = declarationService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<Declaration>>> Get(int id)
        {
            var policies = await _declarationService.GetDeclaration(id);
            return Ok(policies);
        }

        [HttpGet("GetDeclarations/{rolePlayerId}")]
        public async Task<List<Declaration>> GetDeclarations(int rolePlayerId)
        {
            return await _declarationService.GetDeclarations(rolePlayerId);
        }

        [HttpGet("GetMemberComplianceStatus/{rolePlayerId}")]
        public async Task<ComplianceResult> GetMemberComplianceStatus(int rolePlayerId)
        {
            return await _declarationService.GetMemberComplianceStatus(rolePlayerId);
        }

        [HttpGet("GetPolicyComplianceStatus/{policyId}")]
        public async Task<ComplianceResult> GetPolicyComplianceStatus(int policyId)
        {
            return await _declarationService.GetPolicyComplianceStatus(policyId);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Declaration declaration)
        {
            var id = await _declarationService.CreateDeclaration(declaration);
            return Ok(id);
        }

        [HttpPost("CreateDeclarations")]
        public async Task<ActionResult<int>> CreateDeclarations([FromBody] List<Declaration> declarations)
        {
            await _declarationService.CreateDeclarations(declarations);
            return Ok();
        }

        [HttpPost("ManageDeclarations")]
        public async Task<ActionResult> ManageDeclarations([FromBody] List<Declaration> declarations)
        {
            await _declarationService.ManageDeclarations(declarations);
            return Ok();
        }

        [HttpPost("UploadMemberRates")]
        public async Task<ActionResult<UploadRatesSummary>> UploadMemberRates([FromBody] FileContentImport content)
        {
            var result = await _declarationService.UploadMemberRates(content);
            return Ok(result);
        }

        [HttpPost("UploadIndustryRates")]
        public async Task<ActionResult<UploadRatesSummary>> UploadIndustryRates([FromBody] FileContentImport content)
        {
            var result = await _declarationService.UploadIndustryRates(content);
            return Ok(result);
        }

        [HttpGet("GetClientRates/{rolePlayerId}")]
        public async Task<ActionResult<List<ClientRate>>> GetClientRates(int rolePlayerId)
        {
            return await _declarationService.GetClientRates(rolePlayerId);
        }

        [HttpGet("GetClientRate")]
        public async Task<ActionResult<ClientRate>> GetClientRate([FromBody] ClientRateRequest clientRateRequest)
        {
            return await _declarationService.GetClientRate(clientRateRequest);
        }

        [HttpPut("UpdateClientRate")]
        public async Task<ActionResult> UpdateClientRate([FromBody] ClientRate clientRate)
        {
            await _declarationService.UpdateClientRate(clientRate);
            return Ok();
        }

        [HttpGet("GetRateUploadErrorAudit/{fileIdentifier}")]
        public async Task<List<RatesUploadErrorAudit>> GetRateUploadErrorAudit(string fileIdentifier)
        {
            return await _declarationService.GetRateUploadErrorAudit(fileIdentifier);
        }

        [HttpGet("GetPagedRatesUploadErrorAudit/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RatesUploadErrorAudit>>> GetPagedRatesUploadErrorAudit(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var pagedRatesUploadErrorAudit = await _declarationService.GetPagedRatesUploadErrorAudit(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(pagedRatesUploadErrorAudit);
        }

        [HttpGet("GetIndustryClassDeclarationConfigurations")]
        public async Task<ActionResult<List<IndustryClassDeclarationConfiguration>>> GetIndustryClassDeclarationConfigurations()
        {
            return await _declarationService.GetIndustryClassDeclarationConfigurations();
        }

        [HttpGet("GetIndustryClassDeclarationConfiguration/{industryClass}")]
        public async Task<ActionResult<IndustryClassDeclarationConfiguration>> GetIndustryClassDeclarationConfiguration(IndustryClassEnum industryClass)
        {
            return await _declarationService.GetIndustryClassDeclarationConfiguration(industryClass);
        }

        [HttpPost("CreateIndustryClassDeclarationConfigurations")]
        public async Task<ActionResult> CreateIndustryClassDeclarationConfigurations([FromBody] IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration)
        {
            await _declarationService.CreateIndustryClassDeclarationConfigurations(industryClassDeclarationConfiguration);
            return Ok();
        }

        [HttpPut("UpdateIndustryClassDeclarationConfigurations")]
        public async Task<ActionResult> UpdateIndustryClassDeclarationConfigurations([FromBody] IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration)
        {
            await _declarationService.UpdateIndustryClassDeclarationConfigurations(industryClassDeclarationConfiguration);
            return Ok();
        }

        [HttpGet("GenerateWhatsAppCompanyList/{industryClass}")]
        public async Task<ActionResult<List<Contracts.Entities.RolePlayer.RolePlayer>>> GenerateWhatsAppCompanyList(IndustryClassEnum industryClass)
        {
            return await _declarationService.GenerateWhatsAppList(industryClass);
        }

        [HttpGet("GetPagedRolePlayerPolicyTransactions/{policyId}/{coverPeriod}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerPolicyTransaction>>> GetPagedRolePlayerPolicyTransactions(int policyId, int coverPeriod, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var rolePlayerPolicyTransactions = await _declarationService.GetPagedRolePlayerPolicyTransactions(policyId, coverPeriod, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(rolePlayerPolicyTransactions);
        }

        [HttpGet("GetPagedRolePlayerTransactions/{rolePlayerId}/{coverPeriod}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerPolicyTransaction>>> GetPagedRolePlayerTransactions(int rolePlayerId, int coverPeriod, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var rolePlayerPolicyTransactions = await _declarationService.GetPagedRolePlayerTransactions(rolePlayerId, coverPeriod, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(rolePlayerPolicyTransactions);
        }

        [HttpGet("GetPagedRolePlayerPolicyDeclarations/{policyId}/{coverPeriod}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerPolicyTransaction>>> GetPagedRolePlayerPolicyDeclarations(int policyId, int coverPeriod, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var rolePlayerPolicyDeclarations = await _declarationService.GetPagedRolePlayerPolicyDeclarations(policyId, coverPeriod, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(rolePlayerPolicyDeclarations);
        }

        [HttpGet("GetRolePlayerPolicyDeclarations/{policyId}")]
        public async Task<ActionResult<List<RolePlayerPolicyDeclaration>>> GetRolePlayerPolicyDeclarations(int policyId)
        {
            return await _declarationService.GetRolePlayerPolicyDeclarations(policyId);
        }

        [HttpGet("GetRolePlayerDeclarations/{rolePlayerId}")]
        public async Task<ActionResult<List<RolePlayerPolicyDeclaration>>> GetRolePlayerDeclarations(int rolePlayerId)
        {
            return await _declarationService.GetRolePlayerDeclarations(rolePlayerId);
        }

        [HttpGet("GetRolePlayerPolicyTransactionsForCoverPeriod/{policyId}/{coverPeriod}")]
        public async Task<ActionResult<List<RolePlayerPolicyTransaction>>> GetRolePlayerPolicyTransactionsForCoverPeriod(int policyId, int coverPeriod)
        {
            return await _declarationService.GetRolePlayerPolicyTransactionsForCoverPeriod(policyId, coverPeriod);
        }

        [HttpGet("GetRolePlayerPolicyTransactions/{policyId}")]
        public async Task<ActionResult<List<RolePlayerPolicyTransaction>>> GetRolePlayerPolicyTransactions(int policyId)
        {
            return await _declarationService.GetRolePlayerPolicyTransactions(policyId);
        }

        [HttpGet("GetRolePlayerTransactions/{rolePlayerId}")]
        public async Task<ActionResult<List<RolePlayerPolicyTransaction>>> GetRolePlayerTransactions(int rolePlayerId)
        {
            return await _declarationService.GetRolePlayerTransactions(rolePlayerId);
        }

        [HttpGet("GetRolePlayerTransactionsForCoverPeriod/{rolePlayerId}/{coverPeriod}")]
        public async Task<ActionResult<List<RolePlayerPolicyTransaction>>> GetRolePlayerTransactionsForCoverPeriod(int rolePlayerId, int coverPeriod)
        {
            return await _declarationService.GetRolePlayerTransactionsForCoverPeriod(rolePlayerId, coverPeriod);
        }

        [HttpPut("SendInvoices")]
        public async Task<ActionResult> SendInvoices([FromBody] List<RolePlayerPolicyTransaction> rolePlayerPolicyTransactions)
        {
            Contract.Requires(rolePlayerPolicyTransactions != null);

            rolePlayerPolicyTransactions.ForEach(s => s.RolePlayerPolicyTransactionStatus = RolePlayerPolicyTransactionStatusEnum.Queued);
            await _declarationService.SendInvoices(rolePlayerPolicyTransactions);
            return Ok();
        }

        [HttpGet("GetDefaultRenewalPeriodStartDate/{industryClass}/{date}")]
        public async Task<ActionResult<DateTime>> GetDefaultRenewalPeriodStartDate(IndustryClassEnum industryClass, DateTime date)
        {
            return await _declarationService.GetDefaultRenewalPeriodStartDate(industryClass, date);
        }

        [HttpGet("ReleaseBulkInvoices/{industryClass}/{date}")]
        public async Task<ActionResult<int>> ReleaseBulkInvoices(IndustryClassEnum industryClass, DateTime date)
        {
            var result = await _declarationService.ReleaseBulkInvoices(industryClass, date);
            return Ok(result);
        }

        [HttpGet("GetRequiredRenewalRolePlayerPolicyDeclarations/{rolePlayerId}")]
        public async Task<ActionResult<List<Contracts.Entities.Policy.Policy>>> GetRequiredRenewalRolePlayerPolicyDeclarations(int rolePlayerId)
        {
            var result = await _declarationService.GetRequiredRenewalRolePlayerPolicyDeclarations(rolePlayerId);
            return Ok(result);
        }

        [HttpPut("RenewPolicy")]
        public async Task<ActionResult> RenewPolicy([FromBody] Contracts.Entities.Policy.Policy policy)
        {
            await _declarationService.RenewPolicy(policy);
            return Ok();
        }

        [HttpPut("RenewPolicies")]
        public async Task<ActionResult> RenewPolicies([FromBody] List<Contracts.Entities.Policy.Policy> policies)
        {
            await _declarationService.RenewPolicies(policies);
            return Ok();
        }

        [HttpGet("CloseRenewalPeriod/{industryClass}")]
        public async Task<ActionResult<int>> CloseRenewalPeriod(IndustryClassEnum industryClass)
        {
            await _declarationService.CloseRenewalPeriod(industryClass);
            return Ok();
        }

        [HttpPost("GetRequiredDeclarations")]
        public async Task<ActionResult<List<RolePlayerPolicyDeclaration>>> GetRequiredDeclarations([FromBody] Contracts.Entities.Policy.Policy policy)
        {
            var requiredDeclarations = await _declarationService.GetRequiredDeclarations(policy);
            return Ok(requiredDeclarations);
        }

        [HttpGet("GetPagedStagedClientRates/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LoadRate>>> GetPagedStagedClientRates(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var results = await _declarationService.GetPagedStagedClientRates(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("StartRenewalPeriod/{industryClass}")]
        public async Task<ActionResult<int>> StartRenewalPeriod(IndustryClassEnum industryClass)
        {
            await _declarationService.StartRenewalPeriod(industryClass);
            return Ok();
        }

        [HttpPost("GetAllRolePlayerPolicyDeclarations")]
        public async Task<ActionResult<Contracts.Entities.Policy.Policy>> GetAllRolePlayerPolicyDeclarations([FromBody] Contracts.Entities.Policy.Policy policy)
        {
            var results = await _declarationService.GetAllRolePlayerPolicyDeclarations(policy);
            return Ok(results);
        }

        [HttpPost("CreateRolePlayerPolicyOnlineSubmissions")]
        public async Task<ActionResult> CreateRolePlayerPolicyOnlineSubmissions([FromBody] List<RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissions)
        {
            await _declarationService.CreateRolePlayerPolicyOnlineSubmissions(rolePlayerPolicyOnlineSubmissions);
            return Ok();
        }

        [HttpPut("UpdateRolePlayerPolicyOnlineSubmissions")]
        public async Task<ActionResult> UpdateRolePlayerPolicyOnlineSubmissions([FromBody] List<RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissions)
        {
            await _declarationService.UpdateRolePlayerPolicyOnlineSubmissions(rolePlayerPolicyOnlineSubmissions);
            return Ok();
        }


        [HttpGet("GetRolePlayerPolicyOnlineSubmissions/{rolePlayerId}/{submissionYear}")]
        public async Task<ActionResult<List<Contracts.Entities.Policy.Policy>>> GetRolePlayerPolicyOnlineSubmissions(int rolePlayerId, int submissionYear)
        {
            var results = await _declarationService.GetRolePlayerPolicyOnlineSubmissions(rolePlayerId, submissionYear);
            return Ok(results);
        }
    }
}