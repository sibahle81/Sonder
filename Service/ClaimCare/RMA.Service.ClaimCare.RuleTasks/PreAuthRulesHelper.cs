using Newtonsoft.Json;

using RMA.Common.Extensions;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Linq.Dynamic;
using System.Threading.Tasks;

using MediCareRuleTask = RMA.Service.MediCare.RuleTasks.PreAuthRules;
using System.Linq;
using System.Diagnostics.Contracts;

namespace RMA.Service.ClaimCare.RuleTasks
{
    public class PreAuthRulesHelper
    {
        private readonly IPreAuthClaimService _preAuthClaimService;

        public PreAuthRulesHelper(IPreAuthClaimService preAuthClaimService)
        {
            _preAuthClaimService = preAuthClaimService;
        }

        public async Task<ClaimStatusEnum> GetClaimStatus(int claimId)
        {
            var preAuthClaimQuery = await _preAuthClaimService.GetPreAuthClaimDetailByClaimId(claimId);
            return preAuthClaimQuery.ClaimStatus;
        }

        public async Task<string> GetClaimLiabilityStatus(int? personEventId)
        {
            string liabilityStatus = string.Empty;
            if (personEventId != null)
            {
                var preAuthClaimQuery = await _preAuthClaimService.GetPreAuthClaimDetailByPersonEventId(Convert.ToInt32(personEventId));
                var preAuthClaimResult = preAuthClaimQuery.ClaimLiabilityStatus;
                if (!string.IsNullOrEmpty(preAuthClaimResult))
                {
                    liabilityStatus = "{\"LiabilityStatus\": \"status\"}".Replace("status", preAuthClaimResult);
                }
            }
            return liabilityStatus;
        }

        public async Task<string> GetClaimEventDateAndPreAuthFromDateAsRuleData(int? personEventId, DateTime? preAuthFromDate)
        {
            string ruleDataString = string.Empty;
            var preAuthClaimQuery = await _preAuthClaimService.GetPreAuthClaimDetailByPersonEventId(Convert.ToInt32(personEventId));
            var eventDate = preAuthClaimQuery.EventDate;

            if (eventDate != DateTime.MinValue && preAuthFromDate != DateTime.MinValue)
            {
                ruleDataString = "{\"EventDate\": \"" + eventDate.ToString() + "\",\"RequestDate\":\"" + preAuthFromDate.ToString() + "\"}";
            }
            return ruleDataString;
        }

        public async Task<string> GetPreAuthRuleData(int? personEventId, PreAuthorisation preAuthorisation)
        {
            if (preAuthorisation == null)
                throw new ArgumentNullException(nameof(preAuthorisation), "Invoice is null");

            var ruleData = new MediCareRuleTask.RuleData();

            var preAuthClaimQuery = await _preAuthClaimService.GetPreAuthClaimDetailByPersonEventId(Convert.ToInt32(personEventId));

            ruleData.DateAuthorisedFrom = preAuthorisation.DateAuthorisedFrom.ToSaDateTime();
            ruleData.DateAuthorisedTo = preAuthorisation.DateAuthorisedTo.ToSaDateTime();
            ruleData.InjuryDate = preAuthorisation.InjuryDate.ToSaDateTime();
            ruleData.EventDate = preAuthClaimQuery.EventDate;
            ruleData.DateOfDeath = preAuthClaimQuery.DateOfDeath;

            return JsonConvert.SerializeObject(ruleData);

        }

        public async Task<string> GetClaimSTPStatusAsync(int personEventId)
        {
            var preAuthClaimQuery = await _preAuthClaimService.GetPreAuthClaimDetailByPersonEventId(personEventId).ConfigureAwait(true);
            return "{\"IsStp\": \"" + preAuthClaimQuery?.IsStp.ToString() + "\"}";
        }

        public async Task<string> GetPreAuthClaimInjuryStatusAsync(int personEventId, List<PreAuthIcd10Code> preAuthIcd10Codes)
        {
            try
            {
                if (preAuthIcd10Codes == null || !preAuthIcd10Codes.Any())
                {
                    return null;
                }

                // Get all Primary and Secondary Injuries on the Claim
                var primaryInjuries = await _preAuthClaimService.GetPreAuthClaimInjury(personEventId).ConfigureAwait(false);
                var secondaryInjuries = await _preAuthClaimService.GetPreAuthClaimSecondaryInjuries(personEventId).ConfigureAwait(false);

                var allClaimInjuries = new List<ICD10Injury>();

                if (primaryInjuries != null)
                {
                    allClaimInjuries.AddRange(
                        primaryInjuries.Select(injury => new ICD10Injury
                        {
                            ICD10CodeId = injury.Icd10CodeId,
                            BodySideId = Convert.ToInt32(injury.BodySideAffectedType)
                        }));
                }

                if (secondaryInjuries != null)
                {
                    allClaimInjuries.AddRange(
                        secondaryInjuries.Select(injury => new ICD10Injury
                        {
                            ICD10CodeId = injury.Icd10CodeId,
                            BodySideId = Convert.ToInt32(injury.BodySideAffectedType)
                        }));
                }

                var icd10CodesToValidate = preAuthIcd10Codes.Select(code => new ICD10Injury
                {
                    ICD10Code = code.Icd10Code,
                    ICD10CodeId = Convert.ToInt32(code?.Icd10CodeId),
                    BodySideId = Convert.ToInt32(code.BodySideId)
                }).ToList();

                var icd10InjuryData = new ICD10InjuryData
                {
                    ClaimInjuries = allClaimInjuries,
                    ICD10CodesToValidate = icd10CodesToValidate
                };

                return JsonConvert.SerializeObject(icd10InjuryData);
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when getting PreAuth Claim Injury Status - Error Message {ex.Message}");
                return null;
            }
        }

    }
}
