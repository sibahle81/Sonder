using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyIntegrationService : IService
    {
        Task<PolicyResponse> GetPolicyInfo(string policyNumber);
        Task<PolicyResponse> CreateSchemeChildPolicyRestricted(PolicyData policy);
        Task<PolicyResponse> UpdateSchemeChildPolicyRestricted(PolicyData policy);
        Task<bool> ProcessStagedPolicyIntegrationRequests();
        Task<int> CreateCDAPolicy(PolicyDataRequest policyDataRequest);
        Task<PolicyOperationResult> GetParentPolicy(string policyNumber);
        Task<List<PolicyMinimumData>> GetChildPoliciesByParentPolicyNumber(string policyNumber);
        Task<SchemePaymentAllocationResponse> AllocateSchemePayments(PaymentAllocationScheme paymentAllocationScheme);
        Task<List<PaymentAllocationRecord>> GetSchemePaymentAllocationStatus(string parentPolicyNumber, DateTime paymentDate);
        Task<PolicyResponse> UpdatePolicyStatus(PolicyMinimumData policyMinimumData);

        Task<PolicyResponse> PolicyStatusAmendment(PolicyMinimumData policyMinimumData);
        Task<List<SchemePaymentCreditTransaction>> GetSchemePaymentCreditTransactions(string parentPolicyNumber);
        Task<List<PaymentAllocationRecord>> GetPremiumListingTransactionsByInvoiceDate(string parentPolicyNumber, DateTime invoiceDate);
        Task<PolicyResponse> CreateSchemeChildPolicy(PolicyData policyData);
        Task<PolicyResponse> UpdateSchemeChildPolicy(PolicyData policyData);
        Task<List<Contracts.Entities.Policy.Policy>> GetParentPolicies(string query);
        Task<SchemeDeathRegistrationResult> CreateEventForDeathClaim(SchemeDeathDetailExternal schemeDeathDetail);
        Task<List<DeathClaimResponse>> SearchDeathClaim(string query, int pageSize);
        Task<List<PolicyProductOptionModel>> GetPolicyProductOptionInformationByIdNumberAsync(string IdNumber);

        Task<SchemeDeathRegistrationResult> CreateEventForDeathClaims(SchemeDeathDetailRequest schemeDeathDetail);

        Task<decimal> GetEuropAssistFee();
        Task<List<GroupSchemePremiumRoundingExclusion>> GetGroupSchemePremiumRoundingExclusions();

        Task<bool> SendPoliciesToGenaratePolicySchedules(List<int> policyIds);

        Task<bool> SendPolicySchedule(int policyId, string policyCommunicationType);

        Task<bool> ProcessPolicyScheduleEmailQueue();


    }
}