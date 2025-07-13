using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchInvoiceHelperService : IService
    {
        Task<SwitchInvoiceValidationModel> ValidatePracticeNumberExist(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidatePracticeIsActive(SwitchBatchInvoice switchBatchInvoice, HealthCareProvider healthCareProvider);
        Task<int> UpdateSwitchBatchPracticeNumber(SwitchBatchInvoice switchBatchInvoice);
        Task<int> GetHealthCareProviderId(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateInvoiceCount(SwitchBatchInvoice switchBatchInvoice, HealthCareProvider healthCareProvider);
        Task<SwitchInvoiceValidationModel> ValidateServiceDateAndPracticeDate(int switchBatchInvoiceLineId, HealthCareProvider healthCareProvider, DateTime? serviceDate);
        Task<SwitchInvoiceValidationModel> ValidateIfCorrectCodeSubmitted(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateSwitchInvoiceLineTariffAmount(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateInvalidTariffCodeSubmitted(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateNoInvoiceLinesSubmitted(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateAmountOrQuantityRuleSubmitted(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateIfRequestedAmountEqualsToLineTotalSubmitted(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidatePersonName(SwitchBatchInvoice switchBatchInvoice, int personEventId);
        Task<SwitchInvoiceValidationModel> ValidateIDOrPassportNumber(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateTwoYearRule(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateOutstandingRequirementsRule(string liabilityStatus, int switchBatchInvoiceId);
        Task UpdatePreAuthDetailsOnSwitchInvoice(SwitchBatchInvoice switchBatchInvoice);
        Task<PreAuthorisation> GetPreAuthorisationForSwitchInvoice(string preAuthorisationNumber);
        Task<SwitchInvoiceValidationModel> ValidateClaimLiabilityStatus(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateFranchiseAmountLimit(SwitchBatchInvoice switchBatchInvoice, int claimId);
        Task<SwitchInvoiceValidationModel> ValidatePreAuthExist(SwitchBatchInvoice switchBatchInvoice, int healthCareProviderId);
        Task<SwitchInvoiceValidationModel> ValidateClaimReferenceNumber(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateTreatmentDateWithEventDate(SwitchBatchInvoice switchBatchInvoice, string ruleName);
        Task<SwitchInvoiceValidationModel> ValidateTreatmentDateWithDateOfDeath(SwitchBatchInvoice switchBatchInvoice, string ruleName);
        Task<SwitchInvoiceValidationModel> ValidateStaleInvoice(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateServiceDateInFuture(int switchBatchInvoiceLineId, DateTime? serviceDate);
        Task<SwitchInvoiceValidationModel> ValidateBatchInvoiceDates(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateInvoiceLineServiceDateFormat(int switchBatchInvoiceLineId, DateTime? serviceDate);
        Task<SwitchInvoiceValidationModel> ValidateICD10CodeFormatBatchInvoice(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateMedicalInvoiceICD10Codes(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateExternalCauseCodesSupplied(int switchBatchInvoiceLineId, string lineICD10Code);
        Task<string> GetClaimLiabilityStatus(SwitchBatchInvoice switchBatchInvoice);
        Task<string> GetClaimReferenceNumberByClaimId(int claimId);
        Task<bool> CheckIfIsValidClaim(string claimReferenceNumber);
        Task<SwitchInvoiceValidationModel> ValidateInvoiceAmountGreaterThanZero(SwitchBatchInvoice switchBatchInvoice);
        Task<SwitchInvoiceValidationModel> ValidateInvoiceLineAmountGreaterThanZero(SwitchBatchInvoiceLine switchBatchInvoiceLine);
        Task MarkSwitchBatchInvoiceAsProcessed(int switchBatchInvoiceId, int medicalInvoiceId);
        Task<bool> MapSwitchBatchInvoice(SwitchBatchInvoiceMapParams switchBatchInvoiceMapParams);
        Task UpdateSwitchBatchAfterInvoiceIsProcessed(int switchBatchInvoiceId, int switchBatchId);
        Task<SwitchInvoiceStatusEnum> GetBatchInvoiceStatusForUnderAssessReasons(List<int> invoiceUnderAssessReasonList);
        Task<SwitchInvoiceValidationModel> ValidateSwitchInvoiceAllLineStatus(int switchBatchInvoiceId, bool isSwitchInvoiceAllLineActionReject);
        Task<SwitchInvoiceValidationModel> ValidateDuplicateSwitchInvoice(int switchBatchInvoiceId, bool isDuplicateInvoiceExists);
        Task<SwitchInvoiceValidationModel> ValidateDuplicateSwitchInvoiceLine(int switchBatchInvoiceLineId, bool isDuplicateInvoiceLineExists);
    }
}
