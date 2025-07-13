using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IPreAuthorisationService : IService
    {
        Task<int> AddPreAuthorisation(PreAuthorisation preAuthorisation);
        Task<PreAuthorisation> GetPreAuthorisationById(int preAuthorisationId);
        Task<PreAuthorisation> GetPreAuthorisationByPreAuthNumber(string preAuthNumber);
        Task<PagedRequestResult<PreAuthorisation>> GetPreAuthorisationsByUser(PagedRequest request);
        Task<PagedRequestResult<PreAuthorisation>> GetPreAuthorisationsByPersonEvent(PagedRequest request);
        Task<PagedRequestResult<PreAuthorisation>> SearchPreAuthorisation(PagedRequest request);
        Task<PagedRequestResult<PreAuthorisation>> SearchPreAuthorisations(PagedRequest request);
        Task<bool> CheckIfDuplicateLineItem(int personEventId, int healthCareProviderId, int tariffId, DateTime preAuthFromDate, DateTime preAuthToDate);
        Task<List<PreAuthRejectReason>> GetPreAuthRejectReasonList();
        Task UpdatePreAuthorisation(PreAuthorisation preAuthorisation);
        Task DeletePreAuthorisation(int preAuthId);
        Task<ClinicalUpdate> GetClinicalUpdate(int clinicalUpdateId);
        Task<List<ClinicalUpdate>> GetPreAuthClinicalUpdates(int preAuthId);
        Task<List<ClinicalUpdate>> GetClinicalUpdatesList(string requestData);
        Task<PagedRequestResult<ClinicalUpdate>> GetClinicalUpdatesData(PagedRequest request);
        Task<List<PreAuthorisation>> GetAuthorisedPreAuths(int personEventId, bool includeTreatingDoctor);
        Task<List<PreAuthorisation>> GetPreAuthsForPractitionerTypeTreatmentBasket(int personEventId, int practitionerTypeId, DateTime invoiceTreatmentFromDate);
        Task<List<PreAuthorisation>> GetPreAuthsByClaimId(int claimId);
        Task<int> AddClinicalUpdate(ClinicalUpdate clinicalUpdate);
        Task UpdateClinicalUpdate(ClinicalUpdate clinicalUpdate);
        Task DeleteClinicalUpdate(int clinicalUpdateId);
        Task<bool> IsDuplicatePreAuth(int personEventId, int healthCareProviderId, DateTime preAuthFromDate, DateTime preAuthToDate);
        Task<PreAuthPractitionerTypeSetting> GetPreAuthPractitionerTypeSetting(int preAuthTypeId, int practitionerTypeId);
        Task<PreAuthActivity> GetPreAuthActivity(int preAuthId, PreAuthStatusEnum preAuthStatus);
        Task<PagedRequestResult<WorkPool>> GetMedicalBusinessProcesses(WorkPoolEnum workPool, int userId, PagedRequest request);
        Task CreateWorkflow(Workflow workflow);
        Task UpdateWorkflow(Workflow workflow);
        Task<int> AssignWorkflow(Workflow workflow);
        Task<int> LockOrUnlockWorkflow(Workflow workflow);
        Task<int> ReAssignWorkflow(Workflow workflow);
        Task CloseWorkFlow(Workflow workflow);
        Task EscalateWorkflow(Workflow workflow);
        Task<List<PreAuthorisation>> SearchForPreAuthorisation(PreAuthSearchModel preAuthSearchModel);
        Task<PagedRequestResult<PreAuthorisation>> SearchForPreAuthorisations(SearchPreAuthPagedRequest searchPreAuthPagedRequest);
        Task<List<PreAuthBreakdownUnderAssessReason>> ExecutePreauthBreakdownUnderAssessReasonValidations(PreAuthorisation preAuthorisation);
        Task<List<PreAuthorisation>> GetInvoicePreAuthNumbers(DateTime treatmentFromDate, int healthCareProviderId, int personEventId);
        Task<List<PreAuthorisation>> GetInvoiceMappedPreAuthorisations(List<int> preAuthIds);
        Task<List<PreAuthorisation>> CheckIfPreAuthExists(MedicalPreAuthExistCheckParams medicalPreAuthExistCheckParams);
        Task<string> CheckIfDuplicatePreAuth(PreAuthorisation preAuthorisation);
        Task<string> CheckIfProhibitedPractitionerType(int healthCareProviderId);
        Task<int> AddProsthetistQuote(ProsthetistQuote prosthetistQuote);
        Task<PagedRequestResult<ProsthetistQuote>> SearchProsthetistQuotations(PagedRequest request);
        Task<ProsthetistQuote> GetProsthetistQuotationsById(int preAuthorisationId);
        Task UpdateProsthetistQuote(ProsthetistQuote preAuthorisation);
        Task<PagedRequestResult<MedicareWorkPool>> GetMedicalWorkPool(PagedRequest request, string assignedToUserId, int userLoggedIn, int workPoolId, bool isUserBox);
        Task<bool> CreateReviewWizard(PreAuthorisation preAuthorisation);

        Task<int> AddPreAuthorisationUnderAssessReason(PreAuthorisationUnderAssessReason preAuthorisationUnderAssessReason);
        Task<bool> CreateProstheticReviewWizard(int id, int roleid);
    }
}
