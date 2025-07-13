using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.CompCare;

using System.Collections.Generic;
using System.Threading.Tasks;

using Action = RMA.Service.ClaimCare.Contracts.Entities.Action;
using PersonEvent = RMA.Service.ClaimCare.Contracts.Entities.PersonEvent;
using WorkPool = RMA.Service.ClaimCare.Contracts.Entities.WorkPool;

namespace RMA.Service.ClaimCare.Api.Controllers
{
    public class ClaimController : RmaApiController
    {
        private readonly IClaimService _claimService;
        private readonly IClaimIntegrationService _claimV2Service;

        public ClaimController(IClaimService claimService, IClaimIntegrationService claimV2Service)
        {
            _claimService = claimService;
            _claimV2Service = claimV2Service;
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Claim claim)
        {
            var claimId = await _claimService.Create(claim);
            return Ok(claimId);
        }

        [HttpGet("Search/{query}/{page}/{pageSize}/{orderBy}/{sortDirection}/{showActive}")]
        public async Task<ActionResult<List<SearchResult>>> Search(string query, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", bool showActive = true)
        {
            var searchResults = await _claimService.Search(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), showActive);
            return Ok(searchResults);
        }

        [HttpPost("GenerateClaims")]
        public async Task GenerateClaims([FromBody] List<PersonEvent> personEvent)
        {
            await _claimService.GenerateClaims(personEvent);
        }

        [HttpPost("DuplicateClaimCheck")]
        public async Task<ActionResult<PersonEvent>> DuplicateClaimCheck([FromBody] PersonEvent personEvent)
        {
            var result = await _claimService.DuplicateClaimCheck(personEvent);
            return Ok(result);
        }

        [HttpGet("UpdateClaimWithWorkPool/{claimId}/{personEventId}/{workPoolId}/{wizardId}/{claimStatusId}/{userId?}")]
        public async Task UpdateClaimWithWorkPool(int claimId, int personEventId, WorkPoolEnum workPoolId, int wizardId, int claimStatusId, int? userId = null)
        {
            await _claimService.UpdateClaimWithWorkPool(claimId, personEventId, workPoolId, wizardId, claimStatusId, userId);
        }

        [HttpGet("ReAllocateEventToAssessor/{eventReference}/{eventCreatedBy}/{wizardId}/{userName}/{workPoolId}/{claimStatusId}/{userId?}")]
        public async Task ReAllocateEventToAssessor(int eventReference, string eventCreatedBy, int wizardId, string userName, WorkPoolEnum workPoolId, int claimStatusId, int? userId = null)
        {
            await _claimService.ReAllocateEventToAssessor(eventReference, eventCreatedBy, wizardId, userName, workPoolId, claimStatusId, userId);
        }

        [HttpGet("GetWorkPoolsForUser/{userId}")]
        public async Task<List<WorkPoolsModel>> GetWorkPoolsForUser(int userId)
        {
            var result = await _claimService.GetWorkPoolsForUser(userId);
            return result;
        }

        [HttpGet("GetAssessorRecoveries/{recoveryInvokedBy}")]
        public async Task<List<ClaimRecovery>> GetAssessorRecoveries(string recoveryInvokedBy)
        {
            var result = await _claimService.GetAssessorRecoveries(recoveryInvokedBy);
            return result;
        }

        [HttpGet("GetLegalRecoveries/{workPoolId}")]
        public async Task<List<ClaimRecovery>> GetLegalRecoveries(int workPoolId)
        {
            var result = await _claimService.GetLegalRecoveries(workPoolId);
            return result;
        }

        [HttpGet("ReferClaimToLegal/{claimRecoveryId}")]
        public async Task<bool> ReferClaimToLegal(int claimRecoveryId)
        {
            var result = await _claimService.ReferClaimToLegal(claimRecoveryId);
            return result;
        }

        [HttpGet("ReferRecoveryStatus/{status}/{claimRecoveryId}")]
        public async Task ReferRecoveryStatus(ClaimStatusEnum status, int claimRecoveryId)
        {
            await _claimService.ReferRecoveryStatus(status, claimRecoveryId);
        }

        [HttpGet("GetRecoveryViewDetails/{recoveryId}")]
        public async Task<ClaimRecoveryView> GetRecoveryViewDetails(int recoveryId)
        {
            var result = await _claimService.GetRecoveryViewDetails(recoveryId);
            return result;
        }

        [HttpGet("GetTracerDetails/{claimId}")]
        public async Task<TracerModel> GetTracerDetails(int claimId)
        {
            var result = await _claimService.GetTracerInformation(claimId);
            return result;
        }

        [HttpGet("GetTracerInvoices/{claimId}")]
        public async Task<ActionResult<List<ClaimTracerInvoice>>> GetTracerInvoices(int claimId)
        {
            var result = await _claimService.GetTracerInvoices(claimId);
            return result;
        }

        [HttpPost("AuthorizeTracerPayment")]
        public async Task<bool> AuthorizeTracerPayment([FromBody] ClaimTracerInvoice claimTracerInvoice)
        {
            var result = await _claimService.AuthorizeTracerPayment(claimTracerInvoice);
            return result;
        }

        [HttpGet("GetUsersForWorkPool/{workPoolId}/{roleName}/{userId}")]
        public async Task<List<WorkPoolsModel>> GetUsersForWorkPool(WorkPoolEnum workPoolId, string roleName, int userId)
        {
            var result = await _claimService.GetUsersForWorkPool(workPoolId, roleName, userId);
            return result;
        }

        [HttpGet("GetClaimsForWorkPool/{workPoolId}")]
        public async Task<List<Contracts.Entities.WorkPool>> GetClaimsForWorkPool(WorkPoolEnum workPoolId)
        {
            var result = await _claimService.GetClaimsForWorkPool(workPoolId);
            return result;
        }

        [HttpGet("GetClaimsForLoggedInUser")]
        public async Task<List<Contracts.Entities.WorkPool>> GetClaimsForLoggedInUser()
        {
            var result = await _claimService.GetClaimsForLoggedInUser();
            return result;
        }

        [HttpGet("GetUsersToAllocate/{userId}/{lastWorkedOnUsers}/{claimId}/{personEventId}")]
        public async Task<List<WorkPoolsModel>> GetUsersToAllocate(int userId, string lastWorkedOnUsers, string claimId, string personEventId)
        {
            var result = await _claimService.GetUsersToAllocate(userId, lastWorkedOnUsers, claimId, personEventId);
            return result;
        }

        [HttpGet("GetUsersToReAllocate/{userId}")]
        public async Task<List<WorkPoolsModel>> GetUsersToReAllocate(int userId)
        {
            var result = await _claimService.GetUsersToReAllocate(userId);
            return result;
        }

        [HttpPost("AddManageUser")]
        public async Task<ActionResult<int>> AddManageUser([FromBody] ManageUser manageUser)
        {
            var id = await _claimService.AddManageUser(manageUser);
            return Ok(id);
        }

        [HttpGet("GetClaimsByPersonEventId/{caseId}")]
        public async Task<List<Claim>> GetClaimsByPersonEventId(int caseId)
        {
            var result = await _claimService.GetClaimsByPersonEventId(caseId);
            return result;
        }

        [HttpGet("GetBeneficiaryBankingDetail/{claimId}")]
        public async Task<List<Contracts.Entities.Beneficiary>> GetBeneficiaryBankingDetail(int claimId)
        {
            var result = await _claimService.GetBeneficiaryAndBankingDetail(claimId);
            return result;
        }

        [HttpPost("AuthorisedPayment")]
        public async Task<ActionResult> AuthorisedPayment([FromBody] List<ClaimInvoice> claimInvoices)
        {
            await _claimService.AuthorizedPayment(claimInvoices);
            return Ok();
        }

        [HttpPost("CreateClaimPayment")]
        public async Task<ActionResult<ValidationResult>> CreateClaimPayment([FromBody] List<ClaimInvoice> claimInvoices)
        {
            var result = await _claimService.ProcessClaimPayment(claimInvoices);
            return Ok(result);
        }

        [HttpGet("GetClaimInvoice/{claimId}/{beneficiaryId}/{bankAccountId}")]
        public async Task<Contracts.Entities.ClaimInvoice> GetClaimPayment(int claimId, int beneficiaryId, int bankAccountId)
        {
            var result = await _claimService.GetClaimInvoice(claimId, beneficiaryId, bankAccountId);
            return result;
        }

        [HttpPut("UpdateClaimPayment")]
        public async Task<bool> UpdateClaimWizard([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimService.UpdateClaimInvoice(claimInvoice);
            return result;
        }

        [HttpPut("UpdateClaim")]
        public async Task<int> UpdateClaimW([FromBody] Claim claim)
        {
            var result = await _claimService.UpdateClaim(claim);
            return result;
        }

        [HttpGet("GetDeceasedInfo/{policyId}/{insuredLifeId}/{wizardId}")]
        public async Task<PersonEvent> GetDeceasedInfo(int policyId, int insuredLifeId, int wizardId)
        {
            var result = await _claimService.GetDeceasedInfo(policyId, insuredLifeId, wizardId);
            return result;
        }

        [HttpGet("GetBeneficiaryAndBankingDetail/{claimId}")]
        public async Task<List<Beneficiary>> GetBeneficiaryAndBankingDetail(int claimId)
        {
            var result = await _claimService.GetBeneficiaryAndBankingDetail(claimId);
            return result;
        }

        [HttpGet("GetCauseOfDeaths/{deathType}")]
        public async Task<List<CauseOfDeathType>> GetCauseOfDeaths(DeathTypeEnum deathType)
        {
            var result = await _claimService.GetCauseOfDeathType(deathType);
            return result;
        }

        [HttpPut("UpdateClaimStatus")]
        public async Task UpdateClaimStatus([FromBody] Action action)
        {
            await _claimService.UpdateClaimStatus(action);
        }

        [HttpGet("GetBeneficiaryAndBankAccountById/{beneficiaryId}/{bankId}")]
        public async Task<Beneficiary> GetBeneficiaryAndBankAccountById(int beneficiaryId, int bankId)
        {
            var result = await _claimService.GetBeneficiaryAndBankAccountById(beneficiaryId, bankId);
            return result;
        }

        [HttpGet("GetClaimInvoiceForAuthorisation/{claimId}")]
        public async Task<Contracts.Entities.ClaimInvoice> GetClaimInvoiceForAuthorization(int claimId)
        {
            var result = await _claimService.GetClaimInvoiceForAuthorization(claimId);
            return result;
        }

        [HttpGet("GetClaimInvoiceDetailsForDecline/{claimId}")]
        public async Task<List<Contracts.Entities.ClaimInvoice>> GetClaimAndPaymentDetailsForDecline(int claimId)
        {
            var result = await _claimService.GetClaimInvoiceDetailsForDecline(claimId);
            return result;
        }

        [HttpPost("SendDeclineLetterToClaimant")]
        public async Task<bool> SendDeclineLetterToClaimant([FromBody] PersonEvent registerFuneral)
        {
            var result = await _claimService.SendDeclineLetterToClaimant(registerFuneral);
            return result;
        }

        [HttpGet("GetClaimsForUser/{userId}")]
        public async Task<List<Contracts.Entities.WorkPool>> GetClaimsForUser(int userId)
        {
            var result = await _claimService.GetActiveClaimsAssignedToUser(userId);
            return result;
        }

        [HttpGet("GetClaim/{Id}")]
        public async Task<ActionResult<IEnumerable<Claim>>> Get(int Id)
        {
            var result = await _claimService.GetClaim(Id);
            return Ok(result);
        }

        [HttpGet("funeralClaimsReports/{dateFrom}/{dateTo}/{statusId}")]
        public async Task<ActionResult<IEnumerable<FuneralClaimSearchResult>>> SearchFuneralClaimReport(string dateFrom, string dateTo, int statusId)
        {
            var result = await _claimService.GetClaimReport(dateFrom, dateTo, statusId);
            return Ok(result);
        }

        [HttpGet("GetManageClaimDetailsById/{claimId}")]
        public async Task<ManageClaim> GetManageClaimDetailsById(int claimId)
        {
            var result = await _claimService.GetManageClaimDetailsById(claimId);
            return result;
        }
        [HttpGet("GetClaimWorkPoolsPaged/{workPoolId}/{userId}/{selectedUserId}/{pageNumber}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<WorkPool>>> GetClaimWorkPoolsPaged(WorkPoolEnum workPoolId, int userId, int selectedUserId, int pageNumber, int pageSize = 5, string orderBy = "WizardId", string sortDirection = "asc", string query = "")
        {
            var result = await _claimService.GetClaimWorkPoolsPaged(workPoolId, userId, selectedUserId, new PagedRequest(query.Decode(), pageNumber, pageSize, orderBy, sortDirection == "asc"));
            return result;
        }
        [HttpGet("GetDocumentSetName/{claimId}")]
        public async Task<DocumentSetEnum> GetDocumentSetName(DeathTypeEnum deathType, bool IsIndividual)
        {
            var result = await _claimService.GetDocumentSetName(deathType, IsIndividual);
            return result;
        }

        [HttpGet("GetClaimDetailsById/{claimId}")]
        public async Task<Claim> GetClaimDetailsById(int claimId)
        {
            var result = await _claimService.GetClaimDetailsById(claimId);
            return result;
        }

        [HttpPost("AddClaimRuleAudit")]
        public async Task<int> AddClaimRuleAudit([FromBody] List<ClaimRuleAudit> claimRuleAudit)
        {
            return await _claimService.AddClaimRuleAudit(claimRuleAudit);

        }

        [HttpPut("UpdateClaimIsRuleOverridden/{claimId}")]
        public async Task<int> UpdateClaimIsRuleOverridden(int claimId)
        {
            return await _claimService.UpdateClaimIsRuleOverridden(claimId);
        }

        [HttpGet("GetClaimPaymentForAuthorisation/{claimId}")]
        public async Task<Contracts.Entities.ClaimPayment> GetClaimPaymentForAuthorisation(int claimId)
        {
            var result = await _claimService.GetClaimPaymentForAuthorisation(claimId);
            return result;
        }

        [HttpGet("GetClaimAndEventByClaimId/{claimId}")]
        public async Task<Contracts.Entities.WorkPool> GetClaimAndEventByClaimId(int claimId)
        {
            var result = await _claimService.GetClaimAndEventByClaimId(claimId);
            return result;
        }

        [HttpGet("GetPersonEventByPersonEventId/{personEventId}")]
        public async Task<Contracts.Entities.WorkPool> GetPersonEventByPersonEventId(int personEventId)
        {
            var result = await _claimService.GetPersonEventByPersonEventId(personEventId);
            return result;
        }

        [HttpGet("GetPersonEventByClaimId/{claimId}")]
        public async Task<PersonEvent> GetPersonEventByClaimId(int claimId)
        {
            var result = await _claimService.GetPersonEventByClaimId(claimId);
            return result;
        }

        [HttpGet("GetClaimCancellationReasons")]
        public async Task<List<ClaimCancelReason>> GetClaimCancellationReasons()
        {
            var result = await _claimService.GetClaimCancellationReasons();
            return result;
        }

        [HttpGet("GetClaimReOpenReasons")]
        public async Task<List<ClaimReOpenReason>> GetClaimReOpenReasons()
        {
            var result = await _claimService.GetClaimReOpenReasons();
            return result;
        }

        [HttpGet("GetClaimCloseReasons")]
        public async Task<List<ClaimReOpenReason>> GetClaimCloseReasons()
        {
            var result = await _claimService.GetClaimCloseReasons();
            return result;
        }

        [HttpPost("GetClaimsByCoverTypeIds")]
        public async Task<PolicyClaim> GetClaimsByCoverTypeIds([FromBody] CoverTypeModel coverTypeModel)
        {
            var result = await _claimService.GetClaimsByCoverTypeIds(coverTypeModel);
            return result;
        }

        [HttpPost("GetCorporateClaims")]
        public async Task<PolicyClaim> GetCorporateClaims([FromBody] CoverTypeModel coverTypeModel)
        {
            var result = await _claimService.GetCorporateClaims(coverTypeModel);
            return result;
        }

        [HttpPost("GetCorporateRoles")]
        public async Task<List<CorporateResult>> GetCorporateRoles([FromBody] CoverTypeModel coverTypeModel)
        {
            return await _claimService.GetCorporateRoles(coverTypeModel);
        }

        [HttpPost("GetSlaClaims")]
        public async Task<ActionResult<PolicyClaim>> GetSlaClaims(CoverTypeModel coverTypes)
        {
            var events = await _claimService.GetSlaClaims(coverTypes);
            return Ok(events);
        }

        [HttpPost("CheckIfStillbornBenefitExists/{policyId}")]
        public async Task<ActionResult<PolicyClaim>> CheckIfStillbornBenefitExists(int policyId)
        {
            var events = await _claimService.CheckIfStillbornBenefitExists(policyId);
            return Ok(events);
        }

        [HttpGet("GetClaimDetails/{policyId}/{personEventId}")]
        public async Task<ActionResult<Claim>> GetClaimDetails(int policyId, int personEventId)
        {
            var events = await _claimService.GetClaimDetails(policyId, personEventId);
            return Ok(events);
        }

        [HttpGet("GetClaimsByProductOptionId/{productOptionId}")]
        public async Task<PolicyClaim> GetClaimsByProductOptionId(int productOptionId)
        {
            var result = await _claimService.GetClaimsByProductOptionId(productOptionId);
            return result;
        }

        [HttpGet("GetClaimsAssessors")]
        public async Task<AssessorClaims> GetClaimsAssessors()
        {
            return await _claimService.GetClaimsAssessors();
        }

        [HttpGet("getClaimAssessor/{assessorId}")]
        public async Task<User> GetClaimAssessor(int assessorId)
        {
            return await _claimService.GetClaimAssessor(assessorId);
        }

        [HttpPost("Notes")]
        public async Task<ActionResult<int>> AddNote([FromBody] ClaimNote claimNoteModel)
        {
            var id = await _claimService.AddClaimNote(claimNoteModel);
            return Ok(id);
        }

        [HttpPost("RequestAdditionalDocuments")]
        public async Task<ActionResult<ValidationResult>> RequestAddtionalDocuments([FromBody] AdditionalDocument additionalDocument)
        {
            var result = await _claimService.RequestAdditionalDocuments(additionalDocument);
            return Ok(result);
        }

        [HttpPost("RequestOutstandingDocuments")]
        public async Task<ActionResult<ValidationResult>> RequestOutstandingDocuments([FromBody] AdditionalDocument additionalDocument)
        {
            var result = await _claimService.RequestOutstandingDocuments(additionalDocument);
            return Ok(result);
        }

        [HttpPost("SendRecoveryEmail")]
        public async Task<ActionResult<ValidationResult>> SendRecoveryEmail([FromBody] List<ClaimInvoice> claimInvoices)
        {
            var result = await _claimService.SendRecoveryEmail(claimInvoices);
            return Ok(result);
        }

        [HttpGet("GetClaimRepayReasons")]
        public async Task<List<ClaimReOpenReason>> GetClaimRepayReasons()
        {
            var result = await _claimService.GetClaimRepayReasons();
            return result;
        }

        [HttpPut("UpdatePersonEventStatus")]
        public async Task UpdatePersonEventStatus([FromBody] PersonEventAction action)
        {
            await _claimService.UpdatePersonEventStatus(action);
        }

        [HttpPut("ApproveRejectEvent")]
        public async Task<ActionResult> Put([FromBody] Event eventEntity)
        {
            await _claimService.ApproveRejectEvent(eventEntity);
            return Ok();
        }

        [HttpPut("ClaimActionEmailNotification")]
        public async Task ClaimActionEmailNotification([FromBody] ClaimEmailAction action)
        {
            await _claimService.ClaimActionEmailNotification(action);
        }

        [HttpGet("GetClaimNotificationAudit/{itemType}/{itemId}")]
        public async Task<ActionResult<IEnumerable<InsuredLifeResult>>> GetClaimNotificationAudit(string itemType, int itemId)
        {
            var notifications = await _claimService.GetClaimNotificationAudit(itemType, itemId);
            return Ok(notifications);
        }

        [HttpGet("GetClaimSmsAudit/{itemType}/{itemId}/{pageNumber}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<SmsAudit>>> GetClaimSmsAudit(string itemType, int itemId, int pageNumber, int pageSize, string orderBy = "createdDate", string sortDirection = "desc")
        {
            var query = itemId + "," + itemType;
            var notifications = await _claimService.GetClaimSmsAudit(new PagedRequest(query, pageNumber, pageSize, orderBy, sortDirection == "asc"));
            return Ok(notifications);
        }

        [HttpGet("SendFollowUpEmail")]
        public async Task<ActionResult> SendFollowUpEmail()
        {
            await _claimService.SendFollowUpEmail();
            return Ok();
        }

        [HttpGet("GetClaimsByPolicyId/{policyId}")]
        public async Task<ActionResult<List<Claim>>> GetClaimsByPolicyId(int policyId)
        {
            var claims = await _claimService.GetClaimsByPolicyId(policyId);
            return Ok(claims);
        }

        [HttpGet("GetClaimByPolicy/{Id}")]
        public async Task<ActionResult<IEnumerable<Claim>>> GetClaimByPolicy(int Id)
        {
            var result = await _claimService.GetClaimByPolicy(Id);
            return Ok(result);
        }

        [HttpGet("GetDocumentsToDownload/{documentTypeId}")]
        public async Task<RMA.Common.Entities.MailAttachment[]> GetDocumentsToDownload(int documentTypeId)
        {
            var result = await _claimService.GetDocumentsToDownload(documentTypeId);
            return result;
        }

        [HttpPost("DownloadAdditionalDocumentEmailTemplate")]
        public async Task<ActionResult> DownloadAdditionalDocumentEmailTemplate([FromBody] AdditionalDocument additionalDocument)
        {
            var result = await _claimService.DownloadAdditionalDocumentEmailTemplate(additionalDocument);
            return Ok(result);
        }

        [HttpPost("UpdatePolicyInsuredLife")]
        public async Task<ActionResult> UpdatePolicyInsuredLife([FromBody] Item item)
        {
            await _claimService.UpdatePolicyInsuredLife(item);
            return Ok();
        }

        [HttpGet("GetNotesByInsuredLife/{insuredLifeId}")]
        public async Task<ActionResult<IEnumerable<ClaimNote>>> GetNotesByInsuredLife(int insuredLifeId)
        {
            var result = await _claimService.GetNotesByInsuredLife(insuredLifeId);
            return Ok(result);
        }

        [HttpGet("BankAccountVerification/{accountNumber}/{accountType}/{branchCode}/{accountHolderName}/{initials}/{accountHolderIDNumber}")]
        public async Task<bool> BankAccountVerification(string accountNumber, BankAccountTypeEnum accountType, string branchCode, string accountHolderName, string initials, string accountHolderIDNumber)
        {
            var result = await _claimService.BankAccountVerification(accountNumber, accountType, branchCode, accountHolderName, initials, accountHolderIDNumber.Decode());
            return result;
        }

        [HttpPost("SendForInvestigation")]
        public async Task<ActionResult<bool>> SendForInvestigation([FromBody] int personEventID)
        {
            var result = await _claimService.SendForInvestigation(personEventID);
            return Ok(result);
        }

        [HttpGet("GetUnclaimedBenefitValues/{claimId}")]
        public async Task<ActionResult> GetUnclaimedBenefitValues(int claimId)
        {
            var result = await _claimService.GetUnclaimedBenefitValues(claimId);
            return Ok(result);
        }

        [HttpGet("GetClaimsCalculatedAmountByClaimId/{claimId}")]
        public async Task<ActionResult> GetClaimsCalculatedAmountByClaimId(int claimId)
        {
            var result = await _claimService.GetClaimsCalculatedAmountByClaimId(claimId);
            return Ok(result);
        }

        [HttpGet("IsUnclaimedBenefit/{claimId}")]
        public async Task<ActionResult> IsUnclaimedBenefit(int claimId)
        {
            var result = await _claimService.IsUnclaimedBenefit(claimId);
            return Ok(result);
        }

        [HttpGet("GetClaimManagers")]
        public async Task<ActionResult<IEnumerable<User>>> GetClaimManagers()
        {
            var users = await _claimService.GetClaimManagers();
            return Ok(users);
        }

        [HttpGet("GetChannelsForClaims/{brokerNames}")]
        public async Task<ActionResult> GetChannelsForClaims(string brokerNames)
        {
            var channel = await _claimService.GetChannelsForClaims(brokerNames);
            return Ok(channel);
        }

        [HttpGet("GetSchemesForClaims/{channelNames}")]
        public async Task<ActionResult> GetSchemesForClaims(string channelNames)
        {
            var schemes = await _claimService.GetSchemesForClaims(channelNames);
            return Ok(schemes);
        }

        [HttpGet("GetBrokersByProducstLinkedToClaims/{productNames}")]
        public async Task<ActionResult> GetBrokersByProducstLinkedToClaims(string productNames)
        {
            var brokers = await _claimService.GetBrokersByProducstLinkedToClaims(productNames);
            return Ok(brokers);
        }

        [HttpGet("GetSchemesByBrokeragesLinkedToClaims/{brokerageNames}")]
        public async Task<ActionResult> GetSchemesByBrokeragesLinkedToClaims(string brokerageNames)
        {
            var schemes = await _claimService.GetSchemesByBrokeragesLinkedToClaims(brokerageNames);
            return Ok(schemes);
        }

        [HttpGet("GetInsuranceTypesByEventTypeId/{eventTypeId}")]
        public async Task<ActionResult<IEnumerable<ParentInsuranceType>>> GetInsuranceTypesByEventTypeId(int eventTypeId)
        {
            var schemes = await _claimService.GetInsuranceTypesByEventTypeId(eventTypeId);
            return Ok(schemes);
        }

        [HttpGet("GetTypeOfDiseasesByInsuranceTypeId/{insuranceTypeId}")]
        public async Task<ActionResult<IEnumerable<DiseaseType>>> GetTypeOfDiseasesByInsuranceTypeId(int insuranceTypeId)
        {
            var schemes = await _claimService.GetTypeOfDiseasesByInsuranceTypeId(insuranceTypeId);
            return Ok(schemes);
        }

        [HttpGet("GetCausesOfDisease/{diseaseTypeId}")]
        public async Task<ActionResult<IEnumerable<EventCause>>> GetCausesOfDisease(int diseaseTypeId)
        {
            var schemes = await _claimService.GetCausesOfDisease(diseaseTypeId);
            return Ok(schemes);
        }

        [HttpGet("GetDiseaseType/{diseaseTypeId}")]
        public async Task<ActionResult<IEnumerable<EventCause>>> GetDiseaseType(int diseaseTypeId)
        {
            var schemes = await _claimService.GetDiseasesByDiseaseypeId(diseaseTypeId);
            return Ok(schemes);
        }

        [HttpPost("PostClaimRequest")]
        public async Task<ActionResult<RootCCClaimResponse>> PostClaimRequest([FromBody] RootCCClaimRequest claimRequest)
        {
            var result = await _claimV2Service.PostClaimRequest(claimRequest);
            return Ok(result);
        }

        [HttpPost("ClaimQuery")]
        public async Task<ActionResult<ClaimResponse>> GetClaim([FromBody] ClaimRequest claimRequest)
        {
            var result = await _claimV2Service.GetClaim(claimRequest);
            return Ok(result);
        }

        [HttpGet("GetInsuranceTypes")]
        public async Task<ActionResult<IEnumerable<ParentInsuranceType>>> GetInsuranceTypes()
        {
            var schemes = await _claimService.GetInsuranceTypes();
            return Ok(schemes);
        }

        [HttpGet("GetDocumentTypeTemplateForPersonEvent/{docTypeId}/{personEventId}")]
        public async Task<RMA.Common.Entities.MailAttachment[]> GetDocumentTypeTemplateForPersonEvent(DocumentTypeEnum docTypeId, int personEventId)
        {
            var result = await _claimService.GetDocumentTypeTemplateForPersonEvent(docTypeId, personEventId);
            return result;
        }

        [HttpGet("ClaimStatus")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetClaimStatuses()
        {
            return await _claimService.GetClaimStatuses();
        }

        [HttpGet("ProcessBeneficiaryVOPDResponse/{rolePlayerId}")]
        public async Task<ActionResult> ProcessBeneficiaryVOPDResponse(int rolePlayerId)
        {
            await _claimService.ProcessBeneficiaryVOPDResponse(rolePlayerId);
            return Ok();
        }

        [HttpGet("GetPagedClaimsByPolicyId/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Claim>>> GetPagedClaimsByPolicyId(int page = 1, int pageSize = 5, string orderBy = "PersonEventNumber", string sortDirection = "asc", string query = "")
        {
            var result = await _claimService.GetPagedClaimsByPolicyId(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }

        [HttpGet("GetPersonEventClaims/{personEventId}")]
        public async Task<ActionResult<IEnumerable<Claim>>> GetPersonEventClaims(int personEventId)
        {
            var result = await _claimService.GetPersonEventClaims(personEventId);
            return Ok(result);
        }

        [HttpPost("SendAdditionalDocumentsRequest")]
        public async Task<ActionResult<bool>> SendAdditionalDocumentsRequest([FromBody] AdditionalDocumentRequest additionalDocumentRequest)
        {
            var result = await _claimService.SendAdditionalDocumentsRequest(additionalDocumentRequest);
            return Ok(result);
        }

        [HttpGet("GetPagedClaimNotes/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimNote>>> GetPagedClaimNotes(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var claimNotes = await _claimService.GetPagedClaimNotes(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(claimNotes);
        }

        [HttpPut("EditClaimNote")]
        public async Task<ActionResult> EditClaimNote([FromBody] ClaimNote claimNote)
        {
            await _claimService.EditClaimNote(claimNote);
            return Ok();
        }

        [HttpGet("GetPagedClaimsAssignedToUser/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<ClaimNote>>> GetPagedClaimsAssignedToUser(int page = 1, int pageSize = 1, string orderBy = "ClaimId", string sortDirection = "asc", string query = "")
        {
            var claimNotes = await _claimService.GetPagedClaimsAssignedToUser(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(claimNotes);
        }

        [HttpGet("UpdatePersonEventWorkFlow/{personEventId}/{workPool}/{claimStatusId}/{userId}")]
        public async Task UpdatePersonEventWorkFlow(int personEventId, WorkPoolEnum workPool, int claimStatusId, int userId)
        {
            await _claimService.UpdatePersonEventWorkPoolFlow(personEventId, workPool, claimStatusId, userId);
        }

        [HttpGet("GetClaimBenefits/{claimId}")]
        public async Task<ActionResult<List<ClientCare.Contracts.Entities.Product.Benefit>>> GetClaimBenefits(int claimId)
        {
            var result = await _claimService.GetClaimBenefits(claimId);
            return Ok(result);
        }

        [HttpGet("CheckClaimMedicalBenefits/{claimId}")]
        public async Task<ActionResult<bool>> CheckClaimMedicalBenefits(int claimId)
        {
            var result = await _claimService.CheckClaimMedicalBenefits(claimId);
            return Ok(result);
        }

        [HttpGet("NotificationToTeamLeader/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> NotificationToTeamLeader(int personEventId)
        {
            var result = await _claimService.NotificationToTeamLeader(personEventId);
            return Ok(result);
        }

        [HttpGet("NotificationOfLiabilityAcceptance/{personEventId}")]
        public async Task<ActionResult> NotificationOfLiabilityAcceptance(int personEventId)
        {
            var results = await _claimService.NotificationOfLiabilityAcceptance(personEventId);
            return Ok(results);
        }

        [HttpGet("NotificationOfZeroPercentClosure/{personEventId}")]
        public async Task<ActionResult> NotificationOfZeroPercentClosure(int personEventId)
        {
            var results = await _claimService.NotificationOfZeroPercentClosure(personEventId);
            return Ok(results);
        }

        [HttpGet("SendCommunication/{claimId}/{emailTemplateId}")]
        public async Task<ActionResult> SendCommunication(int claimId, int emailTemplateId)
        {
            var results = await _claimService.SendCommunication(claimId, emailTemplateId);
            return Ok(results);
        }

        [HttpGet("RequestDocumentsfromHCP/{claimId}/{healthcareProviderId}/{emailTemplateId}")]
        public async Task<ActionResult> RequestDocumentsfromHCP(int claimId, int healthcareProviderId, int emailTemplateId)
        {
            var results = await _claimService.RequestDocumentsfromHCP(claimId, healthcareProviderId, emailTemplateId);
            return Ok(results);
        }

        [HttpGet("GetSundryServiceProvidersByType/{sundryServiceProviderType}")]
        public async Task<ActionResult<IEnumerable<SundryServiceProvider>>> GetSundryServiceProvidersByType(SundryServiceProviderTypeEnum sundryServiceProviderType)
        {
            var results = await _claimService.GetSundryServiceProvidersByType(sundryServiceProviderType);
            return Ok(results);
        }

        [HttpGet("GetSundryProviders/{request}")]
        public async Task<ActionResult<IEnumerable<SundryServiceProvider>>> GetSundryProviders(string request)
        {
            var results = await _claimService.GetSundryProviders(request);
            return Ok(results);
        }

        [HttpGet("GetAuthorisationLimitsByReferralTypeLimitGroup/{claimReferralTypeLimitGroup}")]
        public async Task<ActionResult<IEnumerable<SundryServiceProvider>>> GetAuthorisationLimitsByReferralTypeLimitGroup(ClaimReferralTypeLimitGroupEnum claimReferralTypeLimitGroup)
        {
            var results = await _claimService.GetAuthorisationLimitsByReferralTypeLimitGroup(claimReferralTypeLimitGroup);
            return Ok(results);
        }

        [HttpPost("ConfirmEstimates")]
        public async Task<ActionResult<bool>> ConfirmEstimates([FromBody] PersonEvent personEvent)
        {
            var result = await _claimService.ConfirmEstimates(personEvent);
            return Ok(result);
        }

        [HttpPost("DeleteClaim")]
        public async Task<ActionResult<int>> DeleteClaim([FromBody] Note claimNote)
        {
            var result = await _claimService.DeleteClaim(claimNote);
            return Ok(result);
        }

        [HttpPost("SubmitInvoicePayment")]
        public async Task<ActionResult<ValidationResult>> SubmitInvoicePayment([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimService.SubmitInvoicePayment(claimInvoice);
            return Ok(result);
        }

        [HttpPost("SubmitMultipleInvoicePayments")]
        public async Task<ActionResult<ValidationResult>> SubmitMultipleInvoicePayments([FromBody] List<ClaimInvoice> claimInvoices)
        {
            await _claimService.SubmitMultipleInvoicePayments(claimInvoices);
            return Ok();
        }

        [HttpPost("RecallClaimPayment")]
        public async Task<ActionResult<bool>> RecallClaimPayment([FromBody] ClaimInvoice claimInvoice)
        {
            var results = await _claimService.RecallPayment(claimInvoice);
            return Ok(results);
        }

        [HttpPost("GetICD10PDPercentageEstimates/{injurySeverityType}")]
        public async Task<ActionResult<int>> GetICD10PDPercentageEstimates([FromBody] List<ICD10EstimateFilter> icd10EstimateFilter, InjurySeverityTypeEnum injurySeverityType)
        {
            var results = await _claimService.GetICD10PDPercentageEstimates(icd10EstimateFilter, injurySeverityType);
            return Ok(results);
        }

        [HttpPost("SendClaimToPensions")]
        public async Task<ActionResult<bool>> SendClaimToPensions([FromBody] Claim claim)
        {
            var result = await _claimService.SendClaimToPensions(claim);
            return Ok(result);
        }

        [HttpPost("GenerateClaimEstimates/{injurySeverityType}/{industryClass}/{personEventId}")]
        public async Task<ActionResult<int>> GenerateClaimEstimates([FromBody] List<ICD10EstimateFilter> icd10EstimateFilter, InjurySeverityTypeEnum injurySeverityType, IndustryClassEnum industryClass, int personEventId)
        {
            var results = await _claimService.GenerateClaimEstimates(icd10EstimateFilter, injurySeverityType, industryClass, personEventId);
            return Ok(results);
        }

        [HttpPut("UpdateClaimPD")]
        public async Task<ActionResult<int>> UpdateClaimPD([FromBody] Claim claim)
        {
            var result = await _claimService.UpdateClaimPD(claim);
            return Ok(result);
        }

        [HttpPost("AddNewClaimsBenefitAmounts")]
        public async Task<ActionResult<int>> AddNewClaimsBenefitAmounts([FromBody] List<ClaimsBenefitsAmount> claimsBenefitsAmounts)
        {
            var results = await _claimService.AddNewClaimsBenefitAmounts(claimsBenefitsAmounts);
            return Ok(results.Count);
        }

        [HttpGet("GetClaimsBenefitAmounts/{activeBenefitsAmounts}")]
        public async Task<ActionResult<IEnumerable<ClaimsBenefitsAmount>>> GetClaimsBenefitAmounts(bool activeBenefitsAmounts)
        {
            var results = await _claimService.GetClaimsBenefitAmounts(activeBenefitsAmounts);
            return Ok(results);
        }

        [HttpPost("AddClaimAdditionalRequiredDocument")]
        public async Task<int> AddClaimAdditionalRequiredDocument([FromBody] List<ClaimAdditionalRequiredDocument> additionalDoc)
        {
            var result = await _claimService.AddClaimAdditionalRequiredDocument(additionalDoc);
            return result;
        }


        [HttpGet("GetClaimAdditionalRequiredDocument/{personeventId}")]
        public async Task<ActionResult<IEnumerable<ClaimAdditionalRequiredDocument>>> GetClaimAdditionalRequiredDocument(int personeventId)
        {
            var results = await _claimService.GetClaimAdditionalRequiredDocument(personeventId);
            return Ok(results);
        }

        [HttpGet("GetEstimatedEarning/{industryClass}/{personEventId}")]
        public async Task<ActionResult<decimal>> GetEstimatedEarning(IndustryClassEnum industryClass, int personEventId)
        {
            var results = await _claimService.GetEstimatedEarning(industryClass, personEventId);
            return Ok(results);
        }

        [HttpGet("GetReferralTypeLimitConfiguration")]
        public async Task<ActionResult<List<ReferralTypeLimitConfiguration>>> GetReferralTypeLimitConfiguration()
        {
            var results = await _claimService.GetReferralTypeLimitConfiguration();
            return Ok(results);
        }

        [HttpPost("SaveReferralTypeLimitConfiguration")]
        public async Task<int> SaveGetReferralTypeLimitConfiguration([FromBody] ReferralTypeLimitConfiguration data)
        {
            var results = await _claimService.SaveReferralTypeLimitConfiguration(data);
            return results;
        }

        [HttpPut("UpdateClaimsBenefitAmounts")]
        public async Task<int> UpdateClaimsBenefitAmounts([FromBody] ClaimsBenefitsAmount claimsBenefitsAmounts)
        {
            var result = await _claimService.UpdateClaimsBenefitAmounts(claimsBenefitsAmounts);
            return result;
        }

        [HttpGet("GetClaimsReferralQueryType")]
        public async Task<ActionResult<IEnumerable<ClaimReferralQueryType>>> GetClaimsReferralQueryType()
        {
            var result = await _claimService.GetClaimsReferralQueryType();
            return result;
        }

        [HttpPost("AddClaimReferralDetail")]
        public async Task<int> AddClaimReferralDetail([FromBody] ClaimReferralDetail claimReferralDetail)
        {
            var result = await _claimService.AddClaimReferralDetail(claimReferralDetail);
            return result;
        }

        [HttpGet("GetClaimReferralDetail/{claimId}")]
        public async Task<ActionResult<IEnumerable<ClaimReferralDetail>>> GetClaimReferralDetail(int claimId)
        {
            var results = await _claimService.GetClaimReferralDetail(claimId);
            return Ok(results);
        }

        [HttpGet("GetClaimReferralQueryType/{referralQueryTypeId}")]
        public async Task<ActionResult<ClaimReferralQueryType>> GetClaimReferralQueryType(int referralQueryTypeId)
        {
            var results = await _claimService.GetClaimReferralQueryType(referralQueryTypeId);
            return Ok(results);
        }

        [HttpPost("RoundRobinByUserPermission")]
        public async Task<User> RoundRobinByUserPermission(List<string> permissions)
        {
            var results = await _claimService.RoundRobinByUserPermission(permissions);
            return results;
        }

        [HttpPost("RejectClaimInvoicePayment")]
        public async Task<ActionResult<int>> RejectClaimInvoicePayment([FromBody] Note claimNote)
        {
            var result = await _claimService.RejectClaimInvoicePayment(claimNote);
            return Ok(result);
        }

        [HttpGet("GetDocumentReceived/{keyName}/{keyValue}/{documentTypeId}")]
        public async Task<ActionResult<bool>> GetDocumentReceived(string keyName, string keyValue, DocumentTypeEnum documentTypeId)
        {
            var results = await _claimService.GetDocumentReceived(keyName, keyValue, documentTypeId);
            return Ok(results);
        }

        [HttpGet("UpdateClaimRequiredDocument/{personEventId}/{documentTypeId}")]
        public async Task<ActionResult<bool>> UpdateClaimRequiredDocument(int personEventId, DocumentTypeEnum documentTypeId)
        {
            var results = await _claimService.UpdateClaimRequiredDocument(personEventId, documentTypeId);
            return Ok(results);
        }

        [HttpPost("CheckBankingDetailsInvoicePayment")]
        public async Task<ActionResult<ValidationResult>> CheckBankingDetailsInvoicePayment([FromBody] ClaimInvoice claimInvoice)
        {
            var result = await _claimService.CheckBankingDetailsInvoicePayment(claimInvoice);
            return Ok(result);
        }

        [HttpGet("GetPersonClaimsByIdNumber/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Claim>>> GetPersonClaimsByIdNumber(int page = 1, int pageSize = 5, string orderBy = "ClaimId", string sortDirection = "desc", string query = "")
        {
            var result = await _claimService.GetPersonClaimsByIdNumber(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "desc"));
            return Ok(result);
        }

        [HttpGet("GetClaimantAcknowledgedAndLiabilityAcceptedClaims/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Claim>>> GetClaimantAcknowledgedAndLiabilityAcceptedClaims(int page = 1, int pageSize = 5, string orderBy = "ClaimId", string sortDirection = "desc", string query = "")
        {
            var result = await _claimService.GetClaimantAcknowledgedAndLiabilityAcceptedClaims(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "desc"));
            return Ok(result);
        }

        [HttpPost("AcknowledgeClaims/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> AcknowledgeClaims([FromBody] List<Policy> policies, int personEventId)
        {
            var result = await _claimService.AcknowledgeClaims(policies, personEventId, false);
            return Ok(result);
        }

        [HttpPost("UnacknowledgeClaims/{personEventId}")]
        public async Task<ActionResult<PersonEvent>> UnacknowledgeClaims([FromBody] List<Policy> policies, int personEventId)
        {
            var result = await _claimService.UnacknowledgeClaims(policies, personEventId);
            return Ok(result);
        }

        [HttpGet("SendMMIHcpReminder")]
        public async Task<ActionResult<PagedRequestResult<Claim>>> SendMMIHcpReminder()
        {
            await _claimService.SendMMIHcpReminder();
            return Ok();
        }

        [HttpPost("GetPagedClaims")]
        public async Task<ActionResult<PagedRequestResult<ClaimSearchResult>>> GetPagedClaims([FromBody] PagedRequest request)
        {
            var results = await _claimService.GetPagedClaims(request);
            return Ok(results);
        }

        [HttpPost("NotifyPersonEventOwnerOrDefaultRole")]
        public async Task<ActionResult<bool>> NotifyPersonEventOwnerOrDefaultRole([FromBody] ClaimNotificationRequest request)
        {
            await _claimService.NotifyPersonEventOwnerOrDefaultRole(request.PersonEventId, request.Message, request.DefaultRoleName);

            return Ok(true);
        }
    }
}