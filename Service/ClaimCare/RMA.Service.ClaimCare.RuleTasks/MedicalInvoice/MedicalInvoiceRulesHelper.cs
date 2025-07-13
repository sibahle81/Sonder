using Newtonsoft.Json;

using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Runtime.Remoting.Contexts;
using System.Threading.Tasks;

using MediCareRuleTask = RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules;

namespace RMA.Service.ClaimCare.RuleTasks
{
    public class MedicalInvoiceRulesHelper
    {
        private readonly IMedicalInvoiceClaimService _medicalInvoiceClaimService;
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IICD10CodeService _icd10CodeService;

        public MedicalInvoiceRulesHelper(IMedicalInvoiceClaimService medicalInvoiceClaimService, IPreAuthorisationService preAuthorisationService, IHealthCareProviderService healthCareProviderService, IICD10CodeService icd10CodeService)
        {
            _medicalInvoiceClaimService = medicalInvoiceClaimService;
            _preAuthorisationService = preAuthorisationService;
            _healthCareProviderService = healthCareProviderService;
            _icd10CodeService = icd10CodeService;
        }

        public async Task<string> GetClaimLiabilityStatus(int? personEventId)
        {
            string liabilityStatus = string.Empty;
            if (personEventId != null)
            {
                var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(personEventId));
                var medicalInvoiceClaimResult = medicalInvoiceClaimQuery.ClaimLiabilityStatus;
                if (!string.IsNullOrEmpty(medicalInvoiceClaimResult))
                {
                    liabilityStatus = "{\"LiabilityStatus\": \"status\"}".Replace("status", medicalInvoiceClaimResult);
                }
            }
            return liabilityStatus;
        }

        public async Task<string> GetClaimEventDateAndMedicalInvoiceFromDateAsRuleData(int? personEventId, DateTime? medicalInvoiceFromDate)
        {
            string ruleDataString = string.Empty;
            var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(personEventId));
            var eventDate = medicalInvoiceClaimQuery.EventDate;

            if (eventDate != DateTime.MinValue && medicalInvoiceFromDate != DateTime.MinValue)
            {
                ruleDataString = "{\"EventDate\": \"" + eventDate.ToString() + "\",\"RequestDate\":\"" + medicalInvoiceFromDate.ToString() + "\"}";
            }
            return ruleDataString;
        }

        public async Task<string> GetMedicalInvoiceRuleData(int? personEventId, Invoice invoice)
        {
            if (invoice == null)
                throw new ArgumentNullException(nameof(invoice), "Invoice is null");

            var ruleData = new MediCareRuleTask.RuleData();

            var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(Convert.ToInt32(personEventId));

            ruleData.InvoiceDate = invoice.InvoiceDate;
            ruleData.TreatmentFromDate = invoice.DateAdmitted;
            ruleData.TreatmentToDate = invoice.DateDischarged;
            ruleData.EventDate = medicalInvoiceClaimQuery.EventDate;
            ruleData.DateOfDeath = medicalInvoiceClaimQuery.DateOfDeath;

            return JsonConvert.SerializeObject(ruleData);

        }

        public async Task<string> GetClaimSTPStatusAsync(int personEventId)
        {
            var medicalInvoiceClaimQuery = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimByPersonEventId(personEventId).ConfigureAwait(true);
            return "{\"IsStp\": \"" + medicalInvoiceClaimQuery?.IsStp.ToString() + "\"}";
        }


        public async Task<string> GetPracticeNumber(string practiceNumber)
        {
            var healthCareProviderByPracticeNumber = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(practiceNumber).ConfigureAwait(true);
            return healthCareProviderByPracticeNumber.PracticeNumber;
        }

        public async Task<string> GetClaimReferenceNumber(string claimReferenceNumber)
        {
            var medicalInvoiceClaimByReferenceNumber = await _medicalInvoiceClaimService.GetMedicalInvoiceClaim(claimReferenceNumber).ConfigureAwait(true);
            return medicalInvoiceClaimByReferenceNumber.ClaimReferenceNumber;
        }

        public async Task<string> GetInvoiceLineClaimInjuriesAsync(int personEventId, int preAuthId, List<InvoiceLineICD10Code> invoiceLineInjuries)
        {
            ICD10InjuryData icd10InjuryData = new ICD10InjuryData();
            //Get all Primary Injuries on the Claim
            var claimInjuries = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimInjury(personEventId).ConfigureAwait(true);
            //Get all Secondary Injuries on the Claim
            var calimSecondaryInjuries = await _medicalInvoiceClaimService.GetMedicalInvoiceClaimSecondaryInjuries(personEventId).ConfigureAwait(true);

            List<ICD10Injury> claimInjuryList = new List<ICD10Injury>();
            foreach (var injury in claimInjuries)
            {
                claimInjuryList.Add(new ICD10Injury { ICD10CodeId = injury.Icd10CodeId, ICD10Code = injury.Icd10Code, BodySideId = Convert.ToInt32(injury.BodySideAffectedType), ICD10DiagnosticGroupId = injury.ICD10DiagnosticGroupId, ICD10DiagnosticGroupCode = injury.ICD10DiagnosticGroupCode, ICD10CategoryId = injury.ICD10CategoryId, ICD10CategoryCode = injury.ICD10CategoryCode, IsPrimary = injury.IsPrimary });
            }
            foreach (var secondaryInjury in calimSecondaryInjuries)
            {
                claimInjuryList.Add(new ICD10Injury { ICD10CodeId = secondaryInjury.Icd10CodeId, BodySideId = Convert.ToInt32(secondaryInjury.BodySideAffectedType), ICD10DiagnosticGroupId = secondaryInjury.ICD10DiagnosticGroupId, ICD10DiagnosticGroupCode = secondaryInjury.ICD10DiagnosticGroupCode, ICD10CategoryId = secondaryInjury.ICD10CategoryId, ICD10CategoryCode = secondaryInjury.ICD10CategoryCode, IsPrimary = secondaryInjury.IsPrimary });
            }
            icd10InjuryData.ClaimInjuries = claimInjuryList;

            if (preAuthId > 0)
            {
                var preAuthDetails = await _preAuthorisationService.GetPreAuthorisationById(preAuthId).ConfigureAwait(true);
                List<ICD10Injury> preAuthICD10Codes = new List<ICD10Injury>();
                foreach (var preAuth in preAuthDetails.PreAuthIcd10Codes)
                {
                    preAuthICD10Codes.Add(new ICD10Injury { ICD10CodeId = (int)preAuth.Icd10CodeId, ICD10Code = preAuth.Icd10Code, BodySideId = preAuth.BodySideId });
                }
                icd10InjuryData.PreAuthICD10Codes = preAuthICD10Codes;
            }

            List<ICD10Injury> invoiceLineInjuryList = new List<ICD10Injury>();
            if (invoiceLineInjuries != null)
            {
                foreach (var invoiceLineInjury in invoiceLineInjuries)
                {
                    var icd10CodeModel = await _icd10CodeService.FilterICD10Code(invoiceLineInjury.Icd10Code);
                    if (icd10CodeModel?.Count > 0)
                    {
                        invoiceLineInjuryList.Add(new ICD10Injury { ICD10CodeId = (int)invoiceLineInjury.Icd10CodeId, ICD10Code = invoiceLineInjury.Icd10Code, BodySideId = invoiceLineInjury.BodySideId, ICD10DiagnosticGroupId = icd10CodeModel[0].Icd10DiagnosticGroupId, ICD10DiagnosticGroupCode = icd10CodeModel[0].Icd10DiagnosticGroupCode, ICD10CategoryId = icd10CodeModel[0].Icd10CategoryId, ICD10CategoryCode = icd10CodeModel[0].Icd10CategoryCode, IsPrimary = true });
                    }
                }
            }
            icd10InjuryData.ICD10CodesToValidate = invoiceLineInjuryList;

            return JsonConvert.SerializeObject(icd10InjuryData);
        }

        public async Task<string> GetMedicalBenefitExists(int claimId, DateTime invoiceDate)
        {
            var medicalBenefitExists = await _medicalInvoiceClaimService.ValidateMedicalBenefit(claimId, invoiceDate).ConfigureAwait(true);
            return "{\"MedicalBenefitExists\": \"" + medicalBenefitExists + "\"}";
        }

        public async Task<decimal> GetVatAmount(bool isVatRegistered, DateTime invoiceDate)
        {
            return await _healthCareProviderService.GetHealthCareProviderVatAmount(isVatRegistered, invoiceDate).ConfigureAwait(true);
        }

        public async Task<bool> GetHealthCareProviderVatStatus(int healthCareProviderId)
        {
            var healthCareProviderDetails = await _healthCareProviderService.GetHealthCareProviderById(healthCareProviderId).ConfigureAwait(true);
            return healthCareProviderDetails.IsVat;
        }
    }
}
