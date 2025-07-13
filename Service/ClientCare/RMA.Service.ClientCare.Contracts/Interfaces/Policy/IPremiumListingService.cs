using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPremiumListingService : IService
    {
        Task<ImportInsuredLivesSummary> ImportGroupPolicyMembers(ImportInsuredLivesRequest importRequest);
        Task<ImportInsuredLivesSummary> ImportGroupPolicy(string wizardName, ImportInsuredLivesRequest importRequest);
        Task<RuleRequestResult> GetGroupPolicyImportErrors(string fileIdentifier);
        Task<int> GetGroupPolicyId(Guid fileIdentifier);
        Task<string> GetGroupPolicyNumber(Guid fileIdentifier);
        Task<List<int>> GetMemberPolicyIds(int parentPolicyId);
        Task<PolicyMember> GetPolicyMemberDetails(string policyNumber);
        Task<List<PolicyMember>> GetGroupPolicyMemberDetails(int parentPolicyId);
        Task<List<PolicyMember>> GetGroupOnboardedMemberDetails(Guid fileIdentifier);
        Task<string> GetMainMemberEmail(int policyId);
        Task<string> GetUploadMessage(Guid fileIdentifier);
        Task<int> UploadPremiumPayments(FileContentImport content);
        Task<int> UploadBulkPaymentListing(int unallocatedPaymentId, FileContentImport content);
        Task<int> ValidatePremiumListingFile(FileContentImport content);
        Task ProcessPendingPremiumListingPaymentFiles();
        Task<List<PremiumListingFile>> GetPremiumListingPaymentFiles(int statusId, DateTime startDate, DateTime endDate);
        Task<List<PremiumPaymentException>> GetPremiumListingPaymentErrors(Guid fileIdentifier);
        Task<int> ValidatePaymentFile(FileContentImport content);
        Task<int> ReverseLastPremiumPayments(int linkedTransactionId);
        Task<int> UploadPremiumPaymentsWithFileLinking(FileImportPremiumPayementModel content);
        Task<PagedRequestResult<PremiumListingMember>> GetPremiumListingMembers(PagedRequest pagedRequest);
        Task<List<PaymentAllocationRecord>> UploadPremiumPaymentsLinking(PaymentAllocationScheme paymentAllocationScheme);
        Task<int> AllocatePremiumPayments(PremiumAllocationRequest content);
        Task<PremiumListingFile> GetPremiumPaymentFile(int fileId);
        Task<List<PremiumListingFile>> GetPremiumListingPaymentFilesByDate(string policyNumber, DateTime startDate, DateTime endDate);

    }
}
