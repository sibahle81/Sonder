using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Member
{
    public interface IDeclarationService : IService
    {
        Task<int> CreateDeclaration(Declaration declaration);
        Task CreateDeclarations(List<Declaration> declarations);
        Task<Declaration> GetDeclaration(int id);
        Task<List<Declaration>> GetDeclarations(int rolePlayerId);
        Task UpdateDeclaration(Declaration declaration);
        Task ManageDeclarations(List<Declaration> declarations);
        Task<ComplianceResult> GetMemberComplianceStatus(int rolePlayerId);
        Task<ComplianceResult> GetPolicyComplianceStatus(int policyId);
        Task<bool> AddEstimatesForUndeclared();
        Task<UploadRatesSummary> UploadMemberRates(FileContentImport content);
        Task<UploadRatesSummary> UploadIndustryRates(FileContentImport content);
        Task<List<ClientRate>> GetClientRates(int rolePlayerId);
        Task<ClientRate> GetClientRate(ClientRateRequest clientRateRequest);
        Task UpdateClientRate(ClientRate clientRate);
        Task<List<RatesUploadErrorAudit>> GetRateUploadErrorAudit(string fileIdentifier);
        Task<PagedRequestResult<RatesUploadErrorAudit>> GetPagedRatesUploadErrorAudit(PagedRequest pagedRequest);
        Task<List<IndustryClassDeclarationConfiguration>> GetIndustryClassDeclarationConfigurations();
        Task<IndustryClassDeclarationConfiguration> GetIndustryClassDeclarationConfiguration(IndustryClassEnum? industryClass);
        Task CreateIndustryClassDeclarationConfigurations(IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration);
        Task UpdateIndustryClassDeclarationConfigurations(IndustryClassDeclarationConfiguration industryClassDeclarationConfiguration);
        Task ManageIndustryClassDeclarationConfigurations(List<IndustryClassDeclarationConfiguration> industryClassDeclarationConfigurations);
        Task<List<Entities.RolePlayer.RolePlayer>> GenerateWhatsAppList(IndustryClassEnum industryClassEnum);
        Task<RolePlayerPolicyDeclaration> GetRolePlayerPolicyDeclaration(int policyId, int declarationYear);
        Task<List<RolePlayerPolicyDeclaration>> GetRolePlayerPolicyDeclarations(int policyId);
        Task<List<RolePlayerPolicyDeclaration>> GetRolePlayerDeclarations(int rolePlayerId);
        Task RaiseTransactions(Entities.Policy.Policy policy);
        Task<PagedRequestResult<RolePlayerPolicyTransaction>> GetPagedRolePlayerPolicyTransactions(int policyId, int coverPeriod, PagedRequest pagedRequest);
        Task<PagedRequestResult<RolePlayerPolicyTransaction>> GetPagedRolePlayerTransactions(int rolePlayerId, int coverPeriod, PagedRequest pagedRequest);
        Task<PagedRequestResult<RolePlayerPolicyDeclaration>> GetPagedRolePlayerPolicyDeclarations(int policyId, int coverPeriod, PagedRequest pagedRequest);
        Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactionsForCoverPeriod(int policyId, int coverPeriod);
        Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactions(int policyId);
        Task<List<RolePlayerPolicyTransaction>> GetRolePlayerTransactions(int rolePlayerId);
        Task<List<RolePlayerPolicyTransaction>> GetRolePlayerTransactionsForCoverPeriod(int rolePlayerId, int coverPeriod);
        Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactionsForRolePlayerPolicy(int rolePlayerId, int policyId);
        Task<RolePlayerPolicyTransaction> GetNextRolePlayerPolicyTransaction(string documentNumber);
        Task SendInvoices(List<RolePlayerPolicyTransaction> rolePlayerPolicyTransactions);
        Task<DateTime> GetDefaultRenewalPeriodStartDate(IndustryClassEnum industryClass, DateTime date);
        Task<int> ReleaseBulkInvoices(IndustryClassEnum industryClass, DateTime effectiveToDate);
        Task<List<Entities.Policy.Policy>> GetRequiredRenewalRolePlayerPolicyDeclarations(int rolePlayerId);
        Task RenewPolicy(Entities.Policy.Policy policy);
        Task RenewPolicies(List<Entities.Policy.Policy> policies);
        Task CloseRenewalPeriod(IndustryClassEnum industryClass);
        Task ProcessCloseRenewalPeriod(CloseRenewalPeriodServiceBusMessage closeRenewalPeriodServiceBusMessage);
        Task<List<RolePlayerPolicyDeclaration>> GetRequiredDeclarations(Entities.Policy.Policy policy);
        Task<PagedRequestResult<LoadRate>> GetPagedStagedClientRates(PagedRequest pagedRequest);
        Task StartRenewalPeriod(IndustryClassEnum industryClass);
        Task<Entities.Policy.Policy> GetAllRolePlayerPolicyDeclarations(Entities.Policy.Policy policy);
        Task<List<RolePlayerPolicyOnlineSubmission>> CreateRolePlayerPolicyOnlineSubmissions(List<RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissions);
        Task UpdateRolePlayerPolicyOnlineSubmissions(List<RolePlayerPolicyOnlineSubmission> rolePlayerPolicyOnlineSubmissions);
        Task<List<Entities.Policy.Policy>> GetRolePlayerPolicyOnlineSubmissions(int rolePlayerId, int submissionYear);
    }
}