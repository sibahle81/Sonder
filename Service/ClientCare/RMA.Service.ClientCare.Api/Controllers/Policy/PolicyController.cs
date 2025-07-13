using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Dashboard;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.Integrations.Contracts.Entities.Qlink;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Policy
{
    [Route("api/Policy/[controller]")]
    public class PolicyController : RmaApiController
    {
        private readonly IPolicyService _policyService;
        private readonly IQLinkService _qlinkService;
        private readonly IConsolidatedFuneralService _consolidatedFuneral;
        private readonly IMyValuePlusService _myValuePlus;
        private readonly ILastViewedService _lastViewedService;
        private readonly IDiscountFileListingService _discountFileListingService;
        private readonly ILifeExtensionService _lifeExtensionService;
        private readonly IPolicyReportService _policyReportService;

        public PolicyController(
            IPolicyService policyService,
            IQLinkService qlinkService,
            IConsolidatedFuneralService consolidatedFuneral,
            IMyValuePlusService myValuePlus,
            IDiscountFileListingService discountFileListingService,
            ILastViewedService lastViewedService,
            ILifeExtensionService lifeExtensionService,
            IPolicyReportService policyReportService
        )
        {
            _policyService = policyService;
            _qlinkService = qlinkService;
            _consolidatedFuneral = consolidatedFuneral;
            _myValuePlus = myValuePlus;
            _lastViewedService = lastViewedService;
            _discountFileListingService = discountFileListingService;
            _lifeExtensionService = lifeExtensionService;
            _policyReportService = policyReportService;
        }

        // GET clc/api/Policy/Policy
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PolicyModel>>> Get()
        {
            //BUG this returns 100% of millions of records, consider the size
            var policies = await _policyService.GetPolicies();
            return Ok(policies);
        }

        [HttpGet("GetPoliciesInDateRange/{fromDate}/{toDate}")]
        public async Task<ActionResult<IEnumerable<PolicyModel>>> GetPoliciesInDateRange(DateTime fromDate, DateTime toDate)
        {
            var policies = await _policyService.GetPoliciesInDateRange(fromDate, toDate);
            return Ok(policies);
        }

        // GET clc/api/Policy/Policy/GetPolicyIdsByRolePlayerId/{id}
        [HttpGet("GetPolicyIdsByRolePlayerId/{rolePlayerId}")]
        public async Task<List<int>> GetPolicyIdsByRolePlayerId(int rolePlayerId)
        {
            return await _policyService.GetPolicyIdsByRolePlayerId(rolePlayerId);
        }

        // GET clc/api/Policy/Policy/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PolicyModel>> Get(int id)
        {
            var policy = await _policyService.GetPolicy(id);
            return Ok(policy);
        }

        // POST clc/api/Policy/Policy
        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] PolicyModel policy)
        {
            var id = await _policyService.AddPolicy(policy);
            return Ok(id);
        }

        // POST clc/api/Policy/Policy/GetProductIdsByPolicyIds
        [HttpPost("GetProductIdsByPolicyIds")]
        public async Task<ActionResult<List<int>>> GetProductIdsByPolicyIds([FromBody] ProductPolicy productPolicy)
        {
            return await _policyService.GetProductIdsByPolicyIds(productPolicy);
        }

        // POST clc/api/Policy/Policy/GetPoliciesByPolicyIds
        [HttpPost("GetPoliciesByPolicyIds")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> GetPoliciesByPolicyIds([FromBody] ProductPolicy productPolicy)
        {
            Contract.Requires(productPolicy != null);
            return await _policyService.GetPoliciesByIds(productPolicy.PolicyIds);
        }

        // PUT clc/api/Policy/Policy/{policy}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Contracts.Entities.Policy.Policy policy)
        {
            await _policyService.EditPolicy(policy, true);
            return Ok();
        }

        // GET clc/api/Policy/Policy/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> LastViewed()
        {
            var policies = await _lastViewedService.GetLastViewedPolicies();
            return Ok(policies);
        }

        [HttpGet("GetPoliciesByRolePlayer/{id}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> GetPoliciesByRolePlayer(int id)
        {
            var policies = await _policyService.GetPoliciesByRolePlayer(id);
            return Ok(policies);
        }

        [HttpGet("GetOnlyPoliciesByRolePlayer/{id}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> GetOnlyPoliciesByRolePlayer(int id)
        {
            var policies = await _policyService.GetOnlyPoliciesByRolePlayer(id);
            return Ok(policies);
        }

        [HttpGet("GetPoliciesWithProductOptionByRolePlayer/{id}")]
        public async Task<ActionResult<IEnumerable<PolicyModel>>> GetPoliciesWithProductOptionByRolePlayer(int id)
        {
            var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(id);
            return Ok(policies);
        }

        [HttpGet("GetPolicyWithProductOptionByPolicyId/{policyId}")]
        public async Task<ActionResult<PolicyModel>> GetPolicyWithProductOptionByPolicyId(int policyId)
        {
            var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyId);
            return Ok(policy);
        }

        [HttpGet("GetPoliciesByPolicyOwner/{id}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> GetPoliciesByPolicyOwner(int id)
        {
            var policies = await _policyService.GetPoliciesByPolicyOwner(id);
            return Ok(policies);
        }

        //GetClaim: clc/api/Policy/Policy/ByBrokerageId/{brokerageId}
        [HttpGet("ByBrokerageId/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.Policy.Policy>>> ByBrokerageId(List<int> brokerageId)
        {
            var policies = await _policyService.GetPoliciesByBrokerageId(brokerageId);
            return Ok(policies);
        }

        [HttpGet("GetPolicyBrokerageByBrokerageId/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<PolicyBrokerage>>> GetPolicyBrokerageByBrokerageId(int brokerageId)
        {
            var policyBrokerages = await _policyService.GetPolicyBrokerageByBrokerageId(brokerageId);
            return Ok(policyBrokerages);
        }

        [HttpGet("GetParentPolicyBrokerageByBrokerageId/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<PolicyBrokerage>>> GetParentPolicyBrokerageByBrokerageId(int brokerageId)
        {
            var policyBrokerages = await _policyService.GetParentPolicyBrokerageByBrokerageId(brokerageId);
            return Ok(policyBrokerages);
        }

        [HttpGet("GetParentPolicyBrokerageByStatusId/{brokerageId}/{statusId}/{pagesize}")]
        public async Task<ActionResult<IEnumerable<PolicyBrokerage>>> GetParentPolicyBrokerageByStatusId(int statusId, int brokerageId, int page = 1, int pageSize = 10)
        {
            var policyBrokerages = await _policyService.GetParentPolicyBrokerageByStatusId(new PagedRequest(string.Empty, page, pageSize), brokerageId, statusId);
            return Ok(policyBrokerages);
        }

        [HttpGet("GetIndividualPolicyHoldersByBrokerageId/{brokerageId}")]
        public async Task<ActionResult<IEnumerable<PolicyBrokerage>>> GeIndividualPolicyHoldersByBrokerageId(int brokerageId)
        {
            var policyBrokerages = await _policyService.GetIndividualPolicyHoldersByBrokerageId(brokerageId);
            return Ok(policyBrokerages);
        }

        [HttpGet("GetParentPolicyBrokerage")]
        public async Task<ActionResult<IEnumerable<PolicyBrokerage>>> GetParentPolicyBrokerage()
        {
            var policyBrokerages = await _policyService.GetParentPolicyBrokerage();
            return Ok(policyBrokerages);
        }

        [HttpGet("GetChildPolicyBrokerageByParentPolicyId/{parentPolicyId}")]
        public async Task<ActionResult<IEnumerable<PolicyBrokerage>>> GetChildPolicyBrokerageByParentPolicyId(int parentPolicyId)
        {
            var policyBrokerages = await _policyService.GetChildPolicyBrokerageByParentPolicyId(parentPolicyId);
            return Ok(policyBrokerages);
        }

        //GetClaim: clc/api/Policy/Policy/ByPolicyIds/{policyIds}
        [HttpGet]
        [Route("ByPolicyIds/{ids}")]
        public async Task<ActionResult<IEnumerable<PolicyModel>>> ByPolicyIds(List<int> policyIds)
        {
            return Ok(await _policyService.GetPoliciesByIds(policyIds));
        }

        [HttpGet("GetPolicyByNumber/{policyNumber}")]
        public async Task<ActionResult<PolicyModel>> GetPolicyByNumber(string policyNumber)
        {
            var policy = await _policyService.GetPolicyByNumber(policyNumber);
            return Ok(policy);
        }

        // PUT clc/api/Policy/Policy/UpdatePolicyStatus/{policy}
        [HttpPut("UpdatePolicyStatus")]
        public async Task<ActionResult<bool>> UpdatePolicyStatus([FromBody] PolicyStatusChangeAudit policyStatusChangeAudit)
        {
            await _policyService.UpdatePolicyStatus(policyStatusChangeAudit);
            return Ok(true);
        }

        // GET clc/api/Policy/Policy/ClientReferenceExists/{clientReference}
        [HttpGet("ClientReferenceExists/{clientReference}")]
        public async Task<ActionResult<bool>> ClientReferenceExists(string clientReference)
        {
            var result = await _policyService.ClientReferenceExists(clientReference);
            return Ok(result);
        }

        [HttpGet("GetPolicyNumber/{policyId}")]
        public async Task<ActionResult<bool>> GetPolicyNumber(int policyId)
        {
            var result = await _policyService.GetPolicyNumber(policyId);
            return Ok(result);
        }

        // GET clc/api/Policy/Policy/GetStillbornBenefitByPolicyId/{policyId}
        [HttpGet("GetStillbornBenefitByPolicyId/{policyId}")]
        public async Task<ActionResult<int>> GetStillbornBenefitByPolicyId(int policyId)
        {
            var result = await _policyService.GetStillbornBenefitByPolicyId(policyId);
            return result;
        }

        // POST clc/api/Policy/Policy/GetStillbornBenefit}
        [HttpPost("GetStillbornBenefit")]
        public async Task<ActionResult<StillbornBenefit>> GetStillbornBenefit([FromBody] StillbornBenefit sbBenefit)
        {
            var result = await _policyService.GetStillbornBenefit(sbBenefit.PolicyIds);
            return result;
        }

        [HttpPost("AddInsuredLife")]
        public async Task<ActionResult<int>> Post([FromBody] PolicyInsuredLife policyInsuredLife)
        {
            var id = await _policyService.CreatePolicyInsuredLife(policyInsuredLife);
            return Ok(id);
        }

        [HttpPost("UploadPremiumListing/{fileName}/{createNewPolicies}")]
        public async Task<ActionResult<List<string>>> ImportPremiumListing(string fileName, bool createNewPolicies, [FromBody] FileContentImport content)
        {
            var errors = await _policyService.ImportPremiumListing(fileName, createNewPolicies, content);
            return Ok(errors);
        }

        [HttpPost("UploadExternalPartnerPolicyData/{fileName}")]
        public async Task<ActionResult<List<string>>> ImportPremiumListing(string fileName, [FromBody] FileContentImport content)
        {
            var errors = await _policyService.ImportExternalPartnerPolicyListing(fileName, content);
            return Ok(errors);
        }

        [HttpPost("UploadConsolidatedFuneral/{fileName}/{policyOnboardOption}/{policyNumber}")]
        public async Task<ActionResult<List<string>>> ImportConsolidatedFuneral(string fileName, PolicyOnboardOptionEnum policyOnboardOption, string policyNumber, [FromBody] FileContentImport content)
        {
            var errors = await _consolidatedFuneral.ImportConsolidatedFuneral(policyOnboardOption, policyNumber, fileName, content);
            return Ok(errors);
        }

        [HttpGet("VerifyConsolidatedFuneralImport/{fileIdentifier}/{policyOnboardOption}/{policyNumber}")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> VerifyConsolidatedFuneralImport(Guid fileIdentifier, PolicyOnboardOptionEnum policyOnboardOption)
        {
            var result = await _consolidatedFuneral.ImportConsolidatedFuneralPolicies(0, "", fileIdentifier, policyOnboardOption, false, false);
            return Ok(result);
        }

        [HttpGet("ConsolidatedFuneralErrors/{fileIdentifier}")]
        public async Task<ActionResult<RuleRequestResult>> ConsolidatedFuneralErrors(Guid fileIdentifier)
        {
            var errors = await _consolidatedFuneral.GetConsolidatedFuneralImportErrors(fileIdentifier);
            return Ok(errors);
        }

        [HttpPost("UploadMyValuePlus/{fileName}/{policyOnboardOption}/{policyNumber}")]
        public async Task<ActionResult<List<string>>> ImportMyValuePlus(string fileName, PolicyOnboardOptionEnum policyOnboardOption, string policyNumber, [FromBody] FileContentImport content)
        {
            var errors = await _myValuePlus.ImportMyValuePlus(policyOnboardOption, policyNumber, fileName, content);
            return Ok(errors);
        }

        [HttpGet("VerifyMyValuePlusImport/{fileIdentifier}/{policyOnboardOption}")]
        public async Task<ActionResult<ImportInsuredLivesSummary>> VerifyMyValuePlusImport(Guid fileIdentifier, PolicyOnboardOptionEnum policyOnboardOption)
        {
            var result = await _myValuePlus.ImportMyValuePlusPolicies(0, "", fileIdentifier, policyOnboardOption, false, false);
            return Ok(result);
        }

        [HttpGet("MyValuePlusErrors/{fileIdentifier}")]
        public async Task<ActionResult<RuleRequestResult>> MyValuePlusErrors(Guid fileIdentifier)
        {
            var errors = await _myValuePlus.GetMyValuePlusImportErrors(fileIdentifier);
            return Ok(errors);
        }

        [HttpGet("GetCancellationsSummaryPerYear")]
        public async Task<ActionResult<List<CancellationSummary>>> CancellationsSummaryPerYear()
        {
            var cancellationSummary = await _policyService.CancellationsSummaryPerYear();
            return Ok(cancellationSummary);
        }

        [HttpGet("GetCancellationsSummaryPerMonth")]
        public async Task<ActionResult<List<CancellationSummary>>> CancellationsSummaryPerMonth()
        {
            var cancellationSummary = await _policyService.CancellationsSummaryPerMonth();
            return Ok(cancellationSummary);
        }

        [HttpGet("GetCancellationsSummaryPerReason")]
        public async Task<ActionResult<List<CancellationSummary>>> CancellationsSummaryPerReason()
        {
            var cancellationSummary = await _policyService.CancellationsSummaryPerReason();
            return Ok(cancellationSummary);
        }

        [HttpGet("GetCancellationsSummaryPerResolved")]
        public async Task<ActionResult<List<CancellationSummary>>> CancellationsSummaryPerResolved()
        {
            var cancellationSummary = await _policyService.CancellationsSummaryPerResolved();
            return Ok(cancellationSummary);
        }

        [HttpGet("GetPoliciesForMember/{memberId}")]
        public async Task<ActionResult<IEnumerable<PolicyModel>>> GetPoliciesForMember(int memberId)
        {
            var policies = await _policyService.GetPoliciesForMember(memberId);
            return Ok(policies);
        }

        [HttpGet("GetAllPoliciesForMember/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyModel>>> GetAllPoliciesForMember(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.GetAllPoliciesForMember(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpGet("GetExternalPartnerPolicyData/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ExternalPartnerPolicyData>>> GetExternalPartnerPolicyData(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.SearchExternalPartnerPolicies(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpPut("SendPolicyInformationDocument")]
        public async Task<ActionResult> SendPolicyInformationDocument([FromBody] PolicyModel policyModel)
        {
            var result = await _policyService.SendPolicyInformationDocument(policyModel);
            return Ok(result);
        }

        [HttpGet("GetCompaniesWithPolicy")]
        public async Task<ActionResult<List<string>>> GetCompaniesWithPolicy()
        {
            var groups = await _policyService.GetCompaniesWithPolicy();
            return Ok(groups);
        }

        [HttpGet("GetFuneralPolicyCompanies")]
        public async Task<ActionResult<List<Company>>> GetFuneralPolicyCompanies()
        {
            var companies = await _policyService.GetFuneralPolicyCompanies();
            return Ok(companies);
        }

        [HttpGet("SendBulkGroupSchedules/{policyId}/{recipients}")]
        public async Task<ActionResult<bool>> SendBulkGroupSchedules(int policyId, string recipients)
        {
            await _policyService.SendBulkGroupSchedules(policyId, recipients);
            return Ok(true);
        }

        [AllowAnonymous]
        [HttpPost("SendSpecifiedGroupSchedules/{policyId}/{recipients}")]
        public async Task<ActionResult<bool>> SendSpecifiedGroupSchedules(int policyId, string recipients, [FromBody] List<string> policyNumbers)
        {
            await _policyService.SendSpecifiedGroupSchedules(policyId, recipients, policyNumbers);
            return Ok(true);
        }

        [HttpGet("GetCompaniesWithPolicyForBroker/{brokerName}")]
        public async Task<ActionResult<List<string>>> GetCompaniesWithPolicyForBroker(string brokerName)
        {
            var groups = await _policyService.GetCompaniesWithPolicyForBroker(brokerName);
            return Ok(groups);
        }

        [HttpPost("LapsePolicy/{policyNumber}/{lapseDate}")]
        public async Task<ActionResult<bool>> LapsePolicy(string policyNumber, DateTime lapseDate)
        {
            var success = await _policyService.LapsePolicy(policyNumber, lapseDate);
            return Ok(success);
        }

        [HttpPost("CancelPolicy/{policyNumber}/{cancelDate}/{cancelReason}")]
        public async Task<ActionResult<bool>> CancelPolicy(string policyNumber, DateTime cancelDate, PolicyCancelReasonEnum cancelReason)
        {
            var success = await _policyService.CancelPolicy(policyNumber, cancelDate, cancelReason);
            return Ok(success);
        }

        [HttpPost("ReinstatePolicy/{policyNumber}/{reinstateDate}")]
        public async Task<ActionResult<bool>> ReinstatePolicy(string policyNumber, DateTime reinstateDate)
        {
            var success = await _policyService.ReinstatePolicy(policyNumber, reinstateDate);
            return Ok(success);
        }

        [HttpGet("GetChildPolicies/{page}/{pageSize}/{orderBy}/{sortDirection}/{query}")]
        public async Task<ActionResult<PagedRequestResult<PolicyModel>>> GetChildPolicies(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.GetChildPolicies(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpGet("GetChildPolicyIds/{parentPolicyId}")]
        public async Task<ActionResult<List<int>>> GetChildPolicyIds(int parentPolicyId)
        {
            var policyIds = await _policyService.GetChildPolicyIds(parentPolicyId);
            return Ok(policyIds);
        }

        [HttpGet("GetChildPoliciesMinimumData/{parentPolicyId}")]
        public async Task<ActionResult<List<PolicyMinimumData>>> GetChildPoliciesMinimumData(int parentPolicyId)
        {
            var policyIds = await _policyService.GetChildPoliciesMinimumData(parentPolicyId);
            return Ok(policyIds);
        }

        // GET clc/api/Policy/Policy/GetVapsPolicyDetails/{policyNumber}
        [HttpGet("GetVapsPolicyDetails/{policyNumber}")]
        public async Task<ActionResult> GetVapsPolicyDetails(string policyNumber)
        {
            var eligibleVapsInsuredLives = await _policyService.GetVapsPolicyDetails(policyNumber);
            return Ok(eligibleVapsInsuredLives);
        }

        // GET clc/api/Policy/Policy/GetVapsPolicyDetails/{policyStatus}
        [HttpGet("GetPoliciesWithStatus/{policyStatus}")]
        public async Task<ActionResult<List<PolicyModel>>> GetPoliciesWithStatus(PolicyStatusEnum policyStatus)
        {
            var policies = await _policyService.GetPoliciesWithStatus(policyStatus);
            return Ok(policies);
        }

        // GET clc/api/Policy/Policy/GetActiveEmployees/
        [HttpGet("GetActiveEmployees")]
        public async Task<ActionResult<List<Dashboard>>> GetActiveEmployees()
        {
            var data = await _policyService.GetActiveMembers();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetAmountInvoiced/
        [HttpGet("GetAmountInvoiced")]
        public async Task<ActionResult<List<Dashboard>>> GetAmountInvoiced()
        {
            var data = await _policyService.GetAmountInvoiced();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetNONCoidMetalMembersPerMonth/
        [HttpGet("GetNONCoidMetalMembersPerMonth")]
        public async Task<ActionResult<List<Dashboard>>> GetNONCoidMetalMembersPerMonth()
        {
            var data = await _policyService.GetNONCoidMetalMembersPerMonth();
            return Ok(data);
        }


        // GET clc/api/Policy/Policy/GetNONCoidMetalMembersPerProduct/
        [HttpGet("GetNONCoidMetalMembersPerProduct")]
        public async Task<ActionResult<List<Dashboard>>> GetNONCoidMetalMembersPerProduct()
        {
            var data = await _policyService.GetNONCoidMetalMembersPerProduct();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetNONCoidMiningMembersPerMonth/
        [HttpGet("GetNONCoidMiningMembersPerMonth")]
        public async Task<ActionResult<List<Dashboard>>> GetNONCoidMiningMembersPerMonth()
        {
            var data = await _policyService.GetNONCoidMiningMembersPerMonth();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetNONCoidMiningMembersPerProduct/
        [HttpGet("GetNONCoidMiningMembersPerProduct")]
        public async Task<ActionResult<List<Dashboard>>> GetNONCoidMiningMembersPerProduct()
        {
            var data = await _policyService.GetNONCoidMiningMembersPerProduct();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetActiveNumberOfMembersCLASSXIII/
        [HttpGet("GetActiveNumberOfMembersCLASSXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetActiveNumberOfMembersCLASSXIII()
        {
            var data = await _policyService.GetActiveNumberOfMembersCLASSXIII();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetAmountInvoicedCLASSXIII/
        [HttpGet("GetAmountInvoicedCLASSXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetAmountInvoicedCLASSXIII()
        {
            var data = await _policyService.GetAmountInvoicedCLASSXIII();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/NumberOFLivesCLASSXIII/
        [HttpGet("GetNumberOFLivesCLASSXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetNumberOFLivesCLASSXIII()
        {
            var data = await _policyService.GetNumberOFLivesCLASSXIII();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/NumberOFLivesCLASSIV/
        [HttpGet("GetNumberOFLivesCLASSIV")]
        public async Task<ActionResult<List<Dashboard>>> GetNumberOFLivesCLASSIV()
        {
            var data = await _policyService.GetNumberOFLivesCLASSIV();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetAmountPaidCLASSIV/
        [HttpGet("GetAmountPaidCLASSIV")]
        public async Task<ActionResult<List<Dashboard>>> GetAmountPaidCLASSIV()
        {
            var data = await _policyService.GetAmountPaidCLASSIV();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetAmountPaidCLASSXIII/
        [HttpGet("GetAmountPaidCLASSXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetAmountPaidCLASSXIII()
        {
            var data = await _policyService.GetAmountPaidCLASSXIII();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetNewBusinessCOIDPoliciesCLASSXIII/
        [HttpGet("GetNewBusinessCOIDPoliciesCLASSXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetNewBusinessCOIDPoliciesCLASSXIII()
        {
            var data = await _policyService.GetNewBusinessCOIDPoliciesCLASSXIII();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetNewBusinessCOIDPoliciesCLASSIV/
        [HttpGet("GetNewBusinessCOIDPoliciesCLASSIV")]
        public async Task<ActionResult<List<Dashboard>>> GetNewBusinessCOIDPoliciesCLASSIV()
        {
            var data = await _policyService.GetNewBusinessCOIDPoliciesCLASSIV();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetMembersPerIndustryClassXIII/
        [HttpGet("GetMembersPerIndustryClassXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetMembersPerIndustryClassXIII()
        {
            var data = await _policyService.GetMembersPerIndustryClassXIII();
            return Ok(data);
        }

        // GET clc/api/Policy/Policy/GetCancellationsCLASSXIII/
        [HttpGet("GetCancellationsCLASSXIII")]
        public async Task<ActionResult<List<Dashboard>>> GetCancellationsCLASSXIII()
        {
            var data = await _policyService.GetCancellationsCLASSXIII();
            return Ok(data);
        }

        [HttpGet("GetPolicyInsurerLookup")]
        public async Task<ActionResult<List<Lookup>>> GetPolicyInsurerLookup()
        {
            var data = await _policyService.GetPolicyInsurerLookup();
            return Ok(data);
        }

        [HttpGet("PolicyProductOption/{policyId}")]
        public async Task<ActionResult<ProductOption>> GetPolicyProductOption(int policyId)
        {
            var productOption = await _policyService.GetPolicyProductOption(policyId);
            return Ok(productOption);
        }

        [HttpPost("GetBenefitsForSelectedPolicies")]
        public async Task<ActionResult<List<BenefitModel>>> GetBenefitsForSelectedPolicies([FromBody] UpgradeDownGradePolicyCase policyCase)
        {
            var benefits = await _policyService.GetBenefitsForSelectedPolicies(policyCase);
            return Ok(benefits);
        }

        [HttpGet("GetCompaniesWithLinkedPolicy")]
        public async Task<ActionResult<List<CompanyPolicy>>> GetCompaniesWithLinkedPolicy()
        {
            var groups = await _policyService.GetCompaniesWithLinkedPolicy();
            return Ok(groups);
        }

        [HttpGet("SearchCompaniesWithPolicy/{page}/{pageSize}/{orderBy}/{sortDirection}/{query}")]
        public async Task<ActionResult<PagedRequestResult<CompanyPolicy>>> SearchCompaniesWithPolicy(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.SearchCompaniesWithPolicy(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpGet("GetPagedChildPolicies/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyGroupMember>>> GetPagedChildPolicies(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policyInsuredLives = await _policyService.GetPagedChildPolicies(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policyInsuredLives);
        }

        [HttpGet("GetPagedPolicyInsuredLives/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyGroupMember>>> GetPagedPolicyInsuredLives(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policyInsuredLives = await _policyService.GetPagedPolicyInsuredLives(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policyInsuredLives);
        }

        [HttpGet("GetPagedPolicyNotes/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyGroupMember>>> GetPagedPolicyNotes(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policyNotes = await _policyService.GetPagedPolicyNotes(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policyNotes);
        }

        [HttpPost("UpdateAffordabilityCheck")]
        public async Task<ActionResult<bool>> UpdateAffordabilityCheck([FromBody] AffordabilityCheck check)
        {
            var success = await _policyService.UpdateAffordabilityCheck(check);
            return Ok(success);
        }

        [HttpGet("GetPolicyStatusChangeAudits/{policyId}")]
        public async Task<ActionResult<List<PolicyStatusChangeAudit>>> GetPolicyStatusChangeAudits(int policyId)
        {
            var policyStatusChangeAudits = await _policyService.GetPolicyStatusChangeAudits(policyId);
            return Ok(policyStatusChangeAudits);
        }

        [HttpGet("GetPagedPolicyStatusChangeAudit/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyStatusChangeAudit>>> GetPagedPolicyStatusChangeAudit(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policyStatusChangeAudits = await _policyService.GetPagedPolicyStatusChangeAudit(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policyStatusChangeAudits);
        }

        [HttpGet("GetChildPolicyCount/{policyId}")]
        public async Task<ActionResult<int>> GetChildPolicyCount(int policyId)
        {
            var count = await _policyService.GetChildPolicyCount(policyId);
            return Ok(count);
        }

        [HttpGet("GetDependentPolicies/{parentPolicyId}")]
        public async Task<ActionResult<List<PolicyModel>>> GetDependentPolicies(int parentPolicyId)
        {
            var policies = await _policyService.GetDependentPolicies(parentPolicyId);
            return Ok(policies);
        }

        [HttpGet("ProcessQlinkTransaction/{policyNumber}/{qLinkTransactionType}")]
        public async Task<ActionResult<bool>> ProcessQlinkTransaction(string policyNumber, QLinkTransactionTypeEnum qLinkTransactionType = QLinkTransactionTypeEnum.QADD, bool checkPreviousTransaction = false)
        {
            var results = await _qlinkService.ProcessQlinkTransactionAsync(new List<string> { policyNumber }, qLinkTransactionType, checkPreviousTransaction);
            return Ok(results);
        }

        // POST clc/api/Policy/Policy/ProcessQlinkTransactions
        [HttpPost("ProcessQlinkTransactions")]
        public async Task<ActionResult<bool>> ProcessQlinkTransactions([FromBody] List<string> policyNumbers, QLinkTransactionTypeEnum qLinkTransactionType = QLinkTransactionTypeEnum.QADD, bool checkPreviousTransaction = false)
        {
            var results = await _qlinkService.ProcessQlinkTransactionAsync(policyNumbers, qLinkTransactionType, checkPreviousTransaction);
            return Ok(results);
        }

        [HttpPost("ProcessQlinkPolicyTransactions")]
        public async Task<ActionResult<List<QlinkTransactionModel>>> ProcessQlinkTransactions([FromBody] ProcessQlinkTransactionRequest request)
        {
            var results = await _qlinkService.ProcessQlinkTransactionAsync(request?.PolicyNumbers, request.QLinkTransactionType, false);
            return Ok(results);
        }

        [HttpGet("GetPolicyDetailRequest/{claimCheckReference}")]
        public async Task<ActionResult<Contracts.Entities.Policy.CFP.PolicyRequest>> GetPolicyDetailRequestAsync(string claimCheckReference)
        {
            var result = await _qlinkService.GetPolicyDetailRequestAsync(claimCheckReference);
            return Ok(result);
        }

        [HttpGet("GetMvpPolicyDetailRequest/{claimCheckReference}")]
        public async Task<ActionResult<Contracts.Entities.Policy.MVP.PolicyRequest>> GetMvpPolicyDetailRequestAsync(string claimCheckReference)
        {
            var result = await _qlinkService.GetMvpPolicyDetailRequestAsync(claimCheckReference);
            return Ok(result);
        }

        [HttpGet("GetConsolidatedFuneralVopdStatus/{fileIdentifier}")]
        public async Task<ActionResult<IEnumerable<MemberVopdStatus>>> GetConsolidatedFuneralVopdStatus(Guid fileIdentifier)
        {
            var result = await _consolidatedFuneral.GetMemberVopdStatus(fileIdentifier);
            return Ok(result);
        }

        [HttpPost("StageImportedConsolidatedFuneral")]
        public async Task<ActionResult<int>> StageImportedConsolidatedFuneral([FromBody] Contracts.Entities.Policy.CFP.PolicyRequest policyRequest)
        {
            var result = await _consolidatedFuneral.StageImportedConsolidatedFuneral(policyRequest);
            return Ok(result);
        }

        [HttpGet("GetMyValuePlusVopdStatus/{fileIdentifier}")]
        public async Task<ActionResult<IEnumerable<MemberVopdStatus>>> GetMyValuePlusVopdStatus(Guid fileIdentifier)
        {
            var result = await _myValuePlus.GetMemberVopdStatus(fileIdentifier);
            return Ok(result);
        }

        [HttpPost("StageImportedMyValuePlus")]
        public async Task<ActionResult<int>> StageImportedMyValuePlus([FromBody] Contracts.Entities.Policy.MVP.PolicyRequest policyRequest)
        {
            var result = await _myValuePlus.StageImportedMyValuePlus(policyRequest);
            return Ok(result);
        }

        [HttpGet("SearchPolicies/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PolicyModel>>> SearchMembers(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var policies = await _policyService.SearchPolicies(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policies);
        }

        [HttpGet("ProcessFailedAffordabilityCheckPolicyNumbers")]
        public async Task<ActionResult<bool>> ProcessFailedAffordabilityCheckPolicyNumbers()
        {
            var result = await _qlinkService.ProcessQlinkFailedAffordabilityCheckPolicyNumbersAsync();
            return Ok(result);
        }

        [HttpGet("CheckPolicyIsActiveOnQlink/{policyNumber}")]
        public async Task<ActionResult<bool>> CheckPolicyIsActiveOnQlink(string policyNumber)
        {
            var result = await _qlinkService.CheckPolicyIsActiveOnQlinkAsync(policyNumber);
            return Ok(result);
        }

        [HttpGet("ActivateQlinkReservations")]
        public async Task<ActionResult<bool>> ActivateQlinkReservations()
        {
            var result = await _qlinkService.ActivateQlinkReservationsAsync();
            return Ok(result);
        }

        [HttpGet("ProcessQlinkQtosTransactions")]
        public async Task<ActionResult<bool>> ProcessQlinkQtosTransactionAsync()
        {
            var result = await _qlinkService.ProcessQlinkQtosTransactionAsync();
            return Ok(result);
        }

        [HttpGet("GetPagedPolicyCovers/{policyId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Cover>>> GetPagedPolicyCovers(int policyId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var policyCovers = await _policyService.GetPagedPolicyCovers(policyId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(policyCovers);
        }

        [HttpGet("MonitorFirstPremiumPendingPolicies")]
        public async Task<ActionResult<bool>> MonitorFirstPremiumPendingPolicies()
        {
            var result = await _policyService.MonitorFirstPremiumPendingPolicies();
            return Ok(result);
        }

        [HttpGet("GetUnderwriterByPolicyId/{policyId}")]
        public async Task<ActionResult<UnderwriterEnum>> GetUnderwriterByPolicyId(int policyId)
        {
            var result = await _policyService.GetUnderwriterByPolicyId(policyId);
            return Ok(result);
        }

        [HttpPost("UploadDiscountFileListing/{fileName}")]
        public async Task<ActionResult<List<string>>> ImportDiscountFileListing(string fileName, [FromBody] FileContentImport content)
        {
            var errors = await _discountFileListingService.ImportDiscountFileListing(fileName, content);
            return Ok(errors);
        }

        [HttpGet("GetPolicyCover/{policyId}")]
        public async Task<ActionResult<List<Cover>>> GetPolicyCover(int policyId)
        {
            var result = await _policyService.GetPolicyCover(policyId);
            return Ok(result);
        }

        [HttpGet("GetPagedDiscountFileListings/{FileIdentifier}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<DiscountFileListing>>> GetPagedDiscountFileListings(Guid fileIdentifier, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var discountsFileListings = await _discountFileListingService.GetPagedDiscountFileListings(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), fileIdentifier);
            return Ok(discountsFileListings);
        }

        [HttpGet("GetDiscountFilesUploaded")]
        public async Task<ActionResult<List<DiscountFile>>> GetDiscountFilesUploaded()
        {
            var result = await _discountFileListingService.GetDiscountFilesUploaded();
            return Ok(result);
        }

        [HttpPost("RejectPaybackPayment")]
        public async Task<ActionResult<PremiumPaybackItem>> RejectPaybackPayment([FromBody] PremiumPaybackItem payback)
        {
            var result = await _lifeExtensionService.RejectPaybackPayment(payback);
            return Ok(result);
        }

        [HttpPost("ValidatePaybackBankAccount")]
        public async Task<ActionResult<PremiumPaybackItem>> ValidatePaybackBankAccount([FromBody] PremiumPaybackItem payback)
        {
            var result = await _lifeExtensionService.ValidatePaybackBankAccount(payback);
            return Ok(result);
        }

        [HttpGet("CalculatePremiumPaybacks")]
        public async Task<ActionResult<int>> CalculatePremiumPaybacks()
        {
            var result = await _lifeExtensionService.CalculatePremiumPaybacks();
            return Ok(result);
        }

        [HttpGet("ProcessPaybackPayments")]
        public async Task<ActionResult<int>> ProcessPaybackPayments()
        {
            var result = await _lifeExtensionService.ProcessPaybackPayments();
            return Ok(result);
        }

        [HttpGet("GetBenefitsForProductOptionAtEffectiveDate/{productOptionId}/{effectiveDate}")]
        public async Task<ActionResult<List<Benefit>>> GetBenefitsForProductOptionAtEffectiveDate(int productOptionId, DateTime effectiveDate)
        {
            var result = await _policyService.GetBenefitsForProductOptionAtEffectiveDate(productOptionId, effectiveDate);
            return result;
        }

        [HttpGet("GetPoliciesByRolePlayerIdNumber/{idNumber}")]
        public async Task<ActionResult<List<PolicyModel>>> GetPoliciesByRolePlayerIdNumber(string idNumber)
        {
            var result = await _policyService.GetPoliciesByRolePlayerIdNumber(idNumber);
            return Ok(result);
        }

        [HttpGet("GetSuccesssfulQlinkTransactions/{policyNumber}")]
        public async Task<ActionResult<List<QlinkPolicyModel>>> GetSuccesssfulQlinkTransactions(string policyNumber)
        {
            var result = await _qlinkService.GetSuccessfulQLinkResultsAsync(policyNumber);
            return Ok(result);
        }

        [HttpPost("QlinkTransactionPolicies")]
        public async Task<ActionResult<List<List<QlinkPolicyModel>>>> GetSuccessfulQLinkResultsAsync(List<string> policyNumbers)
        {
            Contract.Requires(policyNumbers != null);

            try
            {
                var transactionIdsList = new List<List<QlinkPolicyModel>>();

                foreach (var policyNumber in policyNumbers)
                {
                    var results = await _qlinkService.GetSuccessfulQLinkResultsAsync(policyNumber);
                    transactionIdsList.Add(results);
                }
                return Ok(transactionIdsList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while processing the request. {ex.Message}");
            }
        }

        [HttpGet("ProcessStagedQlinkTransactions")]
        public async Task<ActionResult<bool>> ProcessStagedQlinkTransactions()
        {
            var result = await _qlinkService.ProcessStagedQlinkTransactions();
            return Ok(result);
        }

        [HttpPost("GetPagedQlinkTransactions")]
        public async Task<ActionResult<PagedRequestResult<QlinkTransactionModel>>> GetPagedQlinkTransactions([FromBody] QlinkSearchRequest qlinkSearchRequest)
        {
            var results = await _qlinkService.GetPagedQlinkTransactions(qlinkSearchRequest);
            return Ok(results);
        }

        [HttpGet("GenerateStopOrderPaymentFiles")]
        public async Task<ActionResult<bool>> GenerateStopOrderPaymentFiles()
        {
            var result = await _policyReportService.SendCorporatePaymentFiles();
            return Ok(result);
        }

        [HttpGet("GetPolicyTemplatesByPolicyId/{policyId}")]
        public async Task<ActionResult<List<PolicyTemplate>>> GetPolicyTemplatesByPolicyId(int policyId)
        {
            List<PolicyTemplate> result = await _policyService.GetPolicyTemplatesByPolicyId(policyId);
            return Ok(result);
        }

        [HttpGet("LinkReservationToCorrectQaddActivation")]
        public async Task<ActionResult<bool>> LinkReservationToCorrectQaddActivation()
        {
            var result = await _qlinkService.LinkReservationToCorrectQaddActivation();
            return Ok(result);
        }

        [HttpGet("GetMainMemberFuneralPremium/{policyId}/{spouseCount}/{childCount}")]
        public async Task<ActionResult<decimal>> GetMainMemberFuneralPremium(int policyId, int spouseCount, int childCount)
        {
            var funeralpremium = await _policyService.GetMainMemberFuneralPremium(policyId, spouseCount, childCount);
            return Ok(funeralpremium);
        }
    }
}