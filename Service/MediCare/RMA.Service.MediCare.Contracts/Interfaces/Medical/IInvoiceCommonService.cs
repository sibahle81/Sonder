using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceCommonService : IService
    {
        Task<int> EditInvoice(Invoice invoice);
        Task<int> EditTebaInvoice(TebaInvoice tebaInvoice);
        Task<int> EditInvoiceStatus(Invoice invoice);
        Task<int> EditTebaInvoiceStatus(TebaInvoice tebaInvoice);
        Task<InvoiceDetails> GetInvoiceDetails(int invoiceId);
        Task<TebaInvoice> GetTebaInvoice(int tebaInvoiceId);
        Task<TebaTariff> GetTebaTariff(TebaTariffCodeTypeEnum? tebaTariffCodeTypeEnum, DateTime serviceDate);
        Task<List<TebaTariff>> GetTebaTariffs(List<TebaTariff> tariffSearches);
        Task<RolePlayerBankingDetail> GetAuthorisedPayeeBankDetailsByRolePlayerId(int rolePlayerId);
        Task<decimal> GetCumulativeTotalForPersonEvent(int personEventId);
        Task<bool> ClaimLiabilityAccepted(int personEventId);
        Task AddInvoicePreAuthMap(int invoiceId, int tebaInvoiceId, List<PreAuthorisation> preAuthorisations);
        Task<List<PreAuthorisation>> GetMappedInvoicePreAuthDetails(int invoiceId);
        Task<bool> CheckForMedicalReport(int healthCareProviderId, int invoiceId);
        Task<List<int>> GetPendingInvoiceIdsByPersonEventId(int invoiceId, int tebaInvoiceId, int personEventId);
        Task<bool> ValidateICD10Codes(InvoiceDetails invoiceDetails);
        Task<List<InvoiceUnderAssessReason>> ValidateMedicalInvoice(InvoiceDetails invoiceDetails);
        Task<List<RuleRequestResultResponse>> AddRuleRequestResult(RuleRequestResultResponse[] rulesResultArr);
        Task<RuleRequestResultResponse> CheckRequestedAmountExceedAllocatedAmount(int invoiceId, decimal authorisedAmount);
        Task<RuleRequestResultResponse> CheckIfInvoiceIsActive(int invoiceId);
        Task<int> AssessAllocationSubmit(InvoiceAssessAllocateData medicalInvoiceAssessAllocateData);
        Task<InvoiceStatusEnum> GetInvoiceStatusForUnderAssessReasons(int invoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, InvoiceStatusEnum invoiceStatus);
        Task<Dictionary<string, InvoiceLineDetails>> CheckIsInvoiceLineTreatmentBasketAuthorised(InvoiceDetails invoiceDetails);
        Task<Dictionary<string, InvoiceLineDetails>> CheckIsPreAuthLineItemAuthorised(InvoiceDetails invoiceDetails);
        Task<bool> IsPreAuthRequired(int healthCareProviderId, bool isChronic);
        Task<bool> CompareMedicalInvoiceAndLineTotals(InvoiceDetails invoiceDetails);
        Task<bool> CheckIfHealthcareProviderIsActive(int healthcareProviderId);
        Task<InvoiceDetails> GetDuplicateInvoiceDetails(int invoiceId, int personEventId, int healthCareProviderId, string hcpInvoiceNumber, string hcpAccountNumber);
        Task<bool> CheckForDuplicateInvoices(InvoiceDetails invoiceDetails);
        Task<string> CheckForDuplicateInvoice(Invoice invoice);
        Task<string> GetInvoiceLineClaimInjuriesAsync(int personEventId, int preAuthId, List<InvoiceLineICD10Code> invoiceLineInjuries);
        Task<List<InvoiceUnderAssessReason>> ValidateAssessInvoice(InvoiceDetails invoiceDetails);
        Task<int> MedicalInvoicePaymentRequest(InvoiceDetails invoiceDetails);
        Task<int> MedicalInvoicePaymentRequestSTPIntegration(InvoiceDetails invoiceDetails);
        Task<List<InvoiceUnderAssessReason>> ValidatePaymentRequest(InvoiceDetails invoiceDetails);
        Task<List<InvoiceUnderAssessReason>> ValidateTebaPaymentRequest(TebaInvoice tebaInvoice);
        Task<List<InvoiceUnderAssessReason>> AutoAssessInvoice(InvoiceDetails invoiceDetails);
        Task<List<InvoiceUnderAssessReason>> AutoAssessTebaInvoice(TebaInvoice tebaInvoice);
        Task<InvoiceStatusEnum> SetInvoiceStatus(int invoiceId, int tebaInvoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, InvoiceStatusEnum invoiceStatus);
        Task<InvoiceLine> SetInvoiceLine(InvoiceLineDetails invoiceLine);
        Task SaveInvoiceLineUnderAssessReasonsToDB(List<InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasons);
        Task SaveInvoiceUnderAssessReasonsToDB(int invoiceId, int tebaInvoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons);
        Task<InvoiceValidationModel> ExecuteInvoiceLineValidations(InvoiceDetails invoiceDetails);
        Task<InvoiceValidationModel> ExecuteInvoiceValidations(InvoiceDetails invoiceDetails);
        Task<InvoiceValidationModel> ExecuteTebaInvoiceValidations(TebaInvoice tebaInvoice);
        Task<InvoiceValidationModel> ExecuteTebaInvoiceLineValidations(TebaInvoice tebaInvoice);
        Task<List<InvoiceUnderAssessReason>> ExecuteValidationRules(InvoiceDetails invoiceDetails);
        Task<InvoiceValidationModel> ExecuteInvoiceLineValidationsSTPIntegration(InvoiceDetails invoiceDetails);
        Task<InvoiceValidationModel> ExecuteInvoiceValidationsSTPIntegration(InvoiceDetails invoiceDetails);
        Task<PagedRequestResult<InvoiceDetails>> GetPagedInvoiceList(PagedRequest request);
        Task<PagedRequestResult<TebaInvoice>> GetPagedTebaInvoiceList(PagedRequest request);
        Task<List<TebaInvoice>> GetPagedTebaInvoiceDetailsByPersonEventId(int personEventId);
        Task AddInvoiceReportMap(int invoiceId, List<MedicalInvoiceReport> medicalInvoiceReports, DateTime invoiceDate);
        Task<int> DeleteAllocatedInvoice(int invoiceId);
        Task<List<InvoiceDetails>> GetInvoiceDetailsByPersonEventId(int personEventId);
        Task<bool> IsPreauthInvoiceProcessed(int preAuthId);
        Task<List<MedicalReportForm>> GetMappedInvoiceMedicalReports(int invoiceId);
        Task<bool> CheckForDuplicateLineItem(int currentInvoiceLineItemId, int personEventId, int healthCareProviderId, int tariffId, DateTime serviceDate);
        Task<int> UpdateMedicalInvoicePaymentStatus(PaymentStatusEnum paymentStatus, int paymentId);
        Task<List<InvoiceDetails>> GetPendedOrRejectedInvoicesForReinstate(int claimId, string underAssessReasonIds);//*********
        Task<PagedRequestResult<InvoiceDetails>> SearchMedicalInvoice(PagedRequest request);
        Task<PagedRequestResult<InvoiceDetails>> SearchMedicalInvoiceV2(MedicalInvoiceSearchRequest request);
        Task<PaymentAllocationDetails> GetPaymentAllocationByMedicalInvoiceId(int medicalInvoiceId);
        Task<List<PaymentDetails>> GetPaymentsByMedicalInvoiceId(int medicalInvoiceId);
        Task<bool> CheckDuplicateLineItem(DuplicateLineItem duplicateLineItem);
        Task<bool> GetSTPIsFeatureFlagSettingEnabledCommon();
        Task<InvoiceDetails> GetMedicalInvoiceFromCompCare(int invoiceId);
        Task<int> EditInvoiceAuthorisedAmounts(InvoiceDetails invoice);
        Task<int> EditTebaInvoiceAuthorisedAmounts(TebaInvoice tebaInvoice);
        Task<int> GetMappedPreAuthInvoiceDetails(SwitchBatchTypeEnum switchBatchTypeEnum, int preAuthId);
        Task<List<PreAuthorisation>> CheckIfPreAuthExistsCommon(MedicalPreAuthExistCheckParams medicalPreAuthExistCheckParams);
        Task<List<TravelAuthorisation>> CheckIfTravelPreAuthExistsCommon(MedicalPreAuthExistCheckParams travelPreAuthExistCheckParams);
        Task<PagedRequestResult<InvoiceDetails>> SearchForInvoices(SearchInvoicePagedRequest searchInvoicePagedRequest);
        Task<PagedRequestResult<InvoiceDetails>> GetPagedInvoiceDetailsByPersonEventId(int personEventId, PagedRequest request);
        Task<bool> IsModifier(string modifierCode);
        Task<Modifier> GetModifier(string modifierCode);
        Task<ModifierOutput> CalculateModifier(ModifierInput modifierInput);
    }
}
