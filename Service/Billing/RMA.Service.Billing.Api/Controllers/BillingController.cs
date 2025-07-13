using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.Payments;
using RMA.Service.Billing.Contracts.Entities.PolicyPaymentAllocation;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.Billing.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    [Route("api/billing/[controller]")]
    public class BillingController : RmaApiController
    {
        private readonly IBillingService _billingService;
		private readonly IRolePlayerPolicyInvoiceService _rolePlayerPolicyInvoiceService;

        public BillingController(IBillingService billingService, IRolePlayerPolicyInvoiceService rolePlayerPolicyInvoiceService)
        {
            _billingService = billingService;
			_rolePlayerPolicyInvoiceService = rolePlayerPolicyInvoiceService;
        }

        [HttpGet("GetFinPayeeAccountByFinPayeeNumber/{FinPayeeNumber}")]
        public async Task<ActionResult<FinPayee>> GetFinPayeeAccountByFinPayeeNumber(string FinPayeeNumber)
        {
            var finPayee = await _billingService.GetFinPayeeAccountByFinPayeeNumber(FinPayeeNumber);
            return Ok(finPayee);
        }

        [HttpGet("GetAllBillingNotesByRoleplayerId/{rolePlayerId}")]
        public async Task<ActionResult<List<BillingNote>>> GetAllBillingNotesByRoleplayerId(int rolePlayerId)
        {
            var notes = await _billingService.GetAllBillingNotesByRoleplayerId(rolePlayerId);
            return Ok(notes);
        }

        [HttpPost("AddNewNote")]
        public async Task<ActionResult<int>> Post([FromBody] BillingNote billingNote)
        {
            var res = await _billingService.AddBillingNote(billingNote);
            return Ok(res);
        }

        [HttpPost("ImportQLinkPremiumTransactions/{claimCheckReference}")]
        public async Task<ActionResult<bool>> ImportQLinkPremiumTransactions(string claimCheckReference)
        {
            var res = await _billingService.ImportQLinkPremiumTransactionsAsync(claimCheckReference);
            return Ok(res);
        }

        [HttpPost("ImportSpreadsheetPremiumTransactions")]
        public async Task<ActionResult<FileUploadResponse>> ImportSpreadsheetPremiumTransactions([FromBody] FileContentImport fileContent)
        {
            var result = await _billingService.ImportSpreadsheetPremiumTransactionsAsync(fileContent);
            return Ok(result);
        }

        [HttpGet("GetQLinkPaymentRecords/{claimCheckReference}")]
        public async Task<ActionResult<QLinkStatementResponse>> GetQLinkPaymentRecordsAsync(string claimCheckReference)
        {
            var res = await _billingService.GetQLinkPaymentRecordsAsync(claimCheckReference);
            return Ok(res);
        }

        [HttpGet("GetBillingNotesByRoleplayerId/{rolePlayerId}")]
        public async Task<ActionResult<List<BillingNote>>> GetBillingNotesByRoleplayerId(int rolePlayerId)
        {
            var notes = await _billingService.GetBillingNotesByRoleplayerId(rolePlayerId);
            return Ok(notes);
        }


        [HttpGet("GetBillingNotesByRoleplayerIdAndType/{rolePlayerId}/{noteType}")]
        public async Task<ActionResult<List<BillingNote>>> GetBillingNotesByRoleplayerId(int rolePlayerId, BillingNoteTypeEnum noteType)
        {
            var notes = await _billingService.GetBillingNotesByRoleplayerIdAndType(rolePlayerId, noteType);
            return Ok(notes);
        }

        [HttpGet("GetPolicyProductCategoriesByRoleplayerId/{rolePlayerId}")]
        public async Task<ActionResult<List<PolicyProductCategory>>> GetPolicyProductCategoriesByRoleplayerId(int rolePlayerId)
        {
            var results = await _billingService.GetPolicyProductCategoriesByRoleplayerId(rolePlayerId);
            return Ok(results);
        }

        [HttpPost("GetProductBalancesByPolicyIds")]
        public async Task<ActionResult<int>> GetProductBalancesByPolicyIds([FromBody] DebtorProductBalanceRequest request)
        {
            var result = await _billingService.GetProductBalancesByPolicyIds(request);
            return Ok(result);
        }

        [HttpGet("GetAutoAllocationAccounts")]
        public async Task<ActionResult<int>> GetAutoAllocationAccounts()
        {
            var result = await _billingService.GetAutoAllocationAccounts();
            return Ok(result);
        }

        [HttpPost("AddAllocationAccounts")]
        public async Task<ActionResult<int>> AddAllocationAccounts([FromBody] List<AutoAllocationAccount> request)
        {
            var result = await _billingService.AddAllocationAccounts(request);
            return Ok(result);
        }

        [HttpGet("GetBillingInterestIndicatorByRolePlayerId/{rolePlayerId}")]
        public async Task<IActionResult> GetBillingInterestIndicatorByRolePlayerId(int rolePlayerId) //We can make use of IActionResult instead of explicit Task<T> return types
        {
            var interestIndicator = await _billingService.GetBillingInterestIndicatorByRolePlayerId(rolePlayerId);
            return Ok(interestIndicator);
        }

        [HttpGet("GetDebtorProductCategoryBalances/{rolePlayerId}")]
        public async Task<ActionResult<List<DebtorProductCategoryBalance>>> GetDebtorProductCategoryBalances(int rolePlayerId)
        {
            var results = await _billingService.GetDebtorProductCategoryBalances(rolePlayerId);
            return Ok(results);
        }

        [HttpPost("UpdateDebtorStatus")]
        public async Task<ActionResult<bool>> UpdateDebtorStatus([FromBody] DebtorStatusModel request)
        {
            var results = await _billingService.UpdateDebtorStatus(request);
            return Ok(results);
        }

        [HttpGet("GetDebtorOpenCreditTransactions/{rolePlayerId}")]
        public async Task<ActionResult<List<DebtorProductCategoryBalance>>> GetDebtorOpenCreditTransactions(int rolePlayerId)
        {
            var results = await _billingService.GetDebtorOpenCreditTransactions(rolePlayerId);
            return Ok(results);
        }

        [HttpPost("UpdateTheDebtorStatus")]
        public async Task<ActionResult<bool>> UpdateTheDebtorStatus(UpdateDebtorStatusRequest updateDebtorStatusRequest)
        {
            var results = await _billingService.UpdateTheDebtorStatus(updateDebtorStatusRequest);
            return Ok(results);
        }


        [HttpGet("GetDebtorsByCompanyBranch/{industryClassId}/{companyNumber}/{branchNumber}")]
        public async Task<ActionResult<List<DebtorCompanyAndBranchModel>>> GetDebtorsByCompanyBranch(int industryClassId, int companyNumber, int branchNumber)
        {
            var results = await _billingService.GetDebtorsByCompanyBranch(industryClassId, companyNumber, branchNumber);
            return Ok(results);
        }

        [HttpGet("GetCompanies")]
        public async Task<ActionResult<List<CompanyModel>>> GetCompanies()
        {
            var results = await _billingService.GetCompanies();
            return Ok(results);
        }

        [HttpGet("GetBrachesByCompany/{companyNumber}")]
        public async Task<ActionResult<List<BranchModel>>> GetBrachesByCompany(int companyNumber)
        {
            var results = await _billingService.GetBrachesByCompany(companyNumber);
            return Ok(results);
        }

        [HttpGet("GetDebtorsByCompanyBranchAndDate/{companyNumber}/{branchNumber}/{startDate}/{endDate}")]
        public async Task<ActionResult<List<DebtorCompanyAndBranchModel>>> GetDebtorsByCompanyBranchAndDate(int companyNumber, int branchNumber, DateTime startDate, DateTime endDate)
        {
            var results = await _billingService.GetDebtorsByCompanyBranchAndDate(companyNumber, branchNumber, startDate, endDate);
            return Ok(results);
        }

        [HttpPost("UploadWriteOffList")]
        public async Task<ActionResult<decimal>> UploadedWriteOffList([FromBody] BulkWriteOffRequest request)
        {
            var results = await _billingService.WriteOffBulkPremiums(request);
            return Ok(results);
        }

        [HttpPost("UpdateDebtorProductCategoryStatus")]
        public async Task<ActionResult<bool>> UpdateDebtorProductCategoryStatus(DebtorProductCategoryStatusRequest debtorProductCategoryStatusRequest)
        {
            var results = await _billingService.UpdateDebtorProductCategoryStatus(debtorProductCategoryStatusRequest);
            return Ok(results);
        }

        [HttpGet("forecastRates")]
        public async Task<ActionResult<List<ForecastRates>>> GetAllForecastRates()
        {
            var forecastRates = await _billingService.GetAllForecastRates();
            return Ok(forecastRates);
        }

        [HttpPost("updateForecastRates")]
        public async Task<IActionResult> UpdateForecastRates(ForecastRates forecastRates)
        {
            var result = await _billingService.UpdateForecastRate(forecastRates);
            return Ok(result);
        }


        [HttpGet("SearchAllowedAllocationToDebtorAccount/{finPayeNumber}")]
        public async Task<ActionResult<string>> SearchAllowedAllocationToDebtorAccount(string finPayeNumber)
        {
            var results = await _billingService.SearchAllowedAllocationToDebtorAccount(finPayeNumber);
            return Ok(results);
        }

        [HttpPost("UploadHandoverRecon")]
        public async Task<IActionResult> UploadHandoverRecon(List<LegalCommissionRecon> recons)
        {
            var result = await _billingService.UploadHandoverRecon(recons);
            return Ok(result);
        }

        [HttpPost("BulkDebtorHandover")]
        public async Task<IActionResult> BulkDebtorHandover(BulkHandOverRequest content)
        {
            var result = await _billingService.BulkDebtorHandover(content);
            return Ok(result);
        }

        [HttpGet("GetAttorneysForRecon")]
        public async Task<ActionResult<List<string>>> GetAttorneysForRecon()
        {
            var results = await _billingService.GetAttorneysForRecon();
            return Ok(results);
        }
		
		[HttpGet("GetDebtorsPolicyBillingInvoice/{rolePlayerId}/{billingDate}")]
		public async Task<ActionResult<List<PolicyBilling>>> GetDebtorsPolicyBillingInvoice(int rolePlayerId, DateTime billingDate)
		{
			var results = await _rolePlayerPolicyInvoiceService.GetDebtorsPolicyBillingInvoice(rolePlayerId, billingDate);
			return Ok(results);
		}
    }
}