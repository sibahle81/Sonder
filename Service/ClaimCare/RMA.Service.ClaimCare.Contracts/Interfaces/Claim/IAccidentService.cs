using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IAccidentService : IService
    {
        Task<Contracts.Entities.Claim> GetAccidentClaim(int ClaimId);
        Task<List<PatersonGrading>> GetPatersonGradingsBySkill(bool isSkilled);
        Task<List<ClaimBucketClass>> GetClaimBucketClasses();
        Task<ClaimBucketClass> GetClaimBucketClassById(int bucketClassId);
        Task<int> ValidateIsStraigthThroughProcessing(PersonEvent personEvent, DateTime eventDate);
        Task ScheduledAutoAdjudicateSTP();
        Task InstantAdjudicateSTP(PersonEvent personEvent, DateTime eventDate);
        Task AdjudicateNotificationClaims();
        Task AutoCloseStpClaims();
        Task<FirstMedicalReportForm> SetMedicalReportFields(PersonEvent personEvent);
        Task AutoAcceptDocuments(PersonEvent personEvent);
        Task GenerateClaimsForPersonEvents(int eventId);
        Task<string> GenerateClaimNumber(PersonEvent personEvent, DateTime eventDate, int count, string eventNumber);
        Task UpdateAccidentClaimStatus(Contracts.Entities.Claim claim);
        Task<ProgressMedicalReportForm> SetProgressMedicalReportFields(ProgressMedicalReportForm progressMedicalReportForm);
        Task<FinalMedicalReportForm> SetFinalMedicalReportFields(FinalMedicalReportForm finalMedicalReportForm);
        Task<FirstMedicalReportForm> ValidateFirstMedicalReportSTP(FirstMedicalReportForm firstMedicalReportForm);
        Task<ProgressMedicalReportForm> ValidateProgressMedicalReportSTP(ProgressMedicalReportForm finalMedicalReportForm);
        Task<FinalMedicalReportForm> ValidateFinalMedicalReportSTP(FinalMedicalReportForm finalMedicalReportForm);
        Task<FirstMedicalReportForm> ValidateFirstMedicalReport(FirstMedicalReportForm firstMedicalReportForm);
        Task<ProgressMedicalReportForm> ValidateProgressMedicalReport(ProgressMedicalReportForm progressMedicalReportForm);
        Task<List<ProgressMedicalReportForm>> GetProgressMedicalReportForms(int personEventId);
        Task UpdateMedicalReportFormWizardDetail(MedicalReportFormWizardDetail medicalReportFormWizardDetail);
        Task RemoveMedicalReportForm(MedicalReportFormWizardDetail medicalReportFormWizardDetail);
        Task<List<FirstMedicalReportForm>> GetFirstMedicalReportForms(int personEventId);
        Task<FirstMedicalReportForm> GetFirstMedicalReportForm(int personEventId);
        Task<FinalMedicalReportForm> GetFinalMedicalReportForm(int personEventId);
        Task<int> GetMedicalFormDocumentId(int personEventId, int workItemId, MedicalFormReportTypeEnum medicalFormReportType);
        Task<List<FinalMedicalReportForm>> GetFinalMedicalReportForms(int personEventId);
        Task SendAckwonledgementNotifications();
        Task AddEmployeesToAccidentNotification(Wizard wizard);
        Task ReopenClaim(PersonEvent personEvent);
        Task<bool> ProcessSTPIntegrationMessage(string message, string messageId);
        Task<int> RemovePersonEventFromSTP(int personEventId, Note note);
        Task<bool> CheckCompCareMedicalReportEstimates(int personEventId);
        Task ReSubmitSTMRequests();
        Task RerunSTPIntegrationMessage(int serviceBusMessageId);
        Task ResubmitVopdRequests();
        Task ReOpenSection40CompCareClaimsAndSQ();
        Task RemoveMedicalReportFormByDocumentId(int personEventId, int documentId);
        Task AutoAcknowledgeAccidentClaim();
        Task<bool> CloseAccidentClaim(PersonEvent personEvent);
        Task<bool> AddClaimHearingAssessment(ClaimHearingAssessment claimHearingAssessment);
        Task<double> CalculateNihlPercentage(int frequency, float lossLeftEar, float lossRightEar);
        Task<bool> SendZeroPercentClosureLetter(PersonEvent personEvent);
        Task GenerateClaimsForPolicies(List<Policy> policies, int personEventId);
        Task<bool> UpdateFirstMedicalReportForm(FirstMedicalReportForm firstMedicalReport);
        Task<bool> UpdateProgressMedicalReportForm(ProgressMedicalReportForm progressMedicalReport);
        Task<bool> UpdateFinalMedicalReportForm(FinalMedicalReportForm finalMedicalReport);
        Task<bool> RemoveFirstMedicalReportForm(int MedicalReportFormId);
        Task<bool> RemoveProgressMedicalReportForm(int progressMedicalReportFormId);
        Task<bool> RemoveFinalMedicalReportForm(int finalMedicalReportFormId);
        Task<bool> UpdateFirstMedicalReportStatus(int personEventId, DocumentStatusEnum documentStatus);
        Task<PersonEvent> SetNotificationOnlyOrSTP(Entities.Event entitiesEvent, PersonEvent personEvent);
        Task UpdateExistingEvent(Contracts.Entities.Event entitiesEvent, PersonEvent personEvent);
        Task UpdatePersonEventEmployment(PersonEvent personEvent);
        Task SaveFirstMedicalReport(PersonEvent personEvent);
        Task<bool> UpdateClaimHearingAssessment(ClaimHearingAssessment claimHearingAssessment);
        Task ProcessCommsMessage(int serviceBusMessageId);
        Task<bool>  CreateDisabiltyToFatalDeathCaptured(PersonEvent personEvent);
        Task<FirstMedicalReportForm> GetFirstMedicalReportFormByReportType(int personEventId, int reportTypeId);
    }
}