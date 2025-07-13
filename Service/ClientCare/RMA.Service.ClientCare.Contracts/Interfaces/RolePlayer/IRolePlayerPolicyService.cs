using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using GroupPolicy = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IRolePlayerPolicyService : IService
    {
        Task<PagedRequestResult<RolePlayerPolicy>> SearchPolicies(PagedRequest request);
        Task<List<RolePlayerPolicy>> GetPoliciesByIds(List<int> ids);
        Task<RolePlayerPolicy> GetRolePlayerPolicy(int policyId);
        Task<RolePlayerPolicy> GetRolePlayerPolicyByNumber(string policyNumber);
        Task<List<RolePlayerPolicy>> GetPoliciesByRepresentativeId(int representativeId);
        Task<List<RolePlayerPolicy>> SearchPoliciesForCase(string query);
        Task<RolePlayerPolicy> GetRolePlayerPolicyWithNoReferenceData(int policyId);
        Task<List<RolePlayerPolicy>> GetPoliciesByPolicyPayeeIdNoRefData(int rolePlayerId);
        Task<List<RolePlayerPolicy>> GetPoliciesByPolicyOwnerIdNoRefData(int rolePlayerId);
        Task<List<RolePlayerPolicy>> GetRolePlayerPolicyByRolePlayerId(int rolePlayerId);
        Task<List<Entities.RolePlayer.RolePlayer>> GetInsuredLives(int policyId, RolePlayerTypeEnum type);
        Task<List<PolicyInsuredLife>> GetPolicyMembers(int policyId);
        Task<PagedRequestResult<Entities.RolePlayer.RolePlayer>> GetInsuredLivesToContinuePolicy(PagedRequest request);
        Task<List<RolePlayerRelation>> GetRolePlayerRelations(int toRolePlayerId, int policyId);
        Task SubmitPolicyCancellation(Entities.RolePlayer.RolePlayer rolePlayer, string cancellationInitiatedBy, DateTime cancellationInitiatedDate);
        Task<int> MovePolicies(MovePoliciesCase policyMovementCase);
        Task<int> VerifyPolicyExists(string policyNumber);
        Task SaveRolePlayerRelations(Case policyCase);
        Task UpdateMainMemberRelations(int policyId, int mainMemberId);
        Task RemoveDeletedRelations(Case policyCase);
        Task ContinuePolicy(Case policyCase);
        Task EditContinuePolicy(Case policyCase);
        Task EditPolicy(Case policyCase);
        Task<bool> UpdatePolicyStatus(RolePlayerPolicy rolePlayerPolicy);
        Task UpdatePolicyStatusAfterSuccessfulPayment(int policyId);
        Task EditRolePlayerPolicies(List<RolePlayerPolicy> rolePlayerPolicies);
        Task<int> CancelRequestGroupPolicyChild(int policyId, int status);
        Task<int> GetGroupPolicyStatus(int policyId);
        Task<PolicyMovement> VerifyPolicyMovementExists(string refNumber);
        Task<List<RolePlayerPolicy>> SearchPoliciesByIdNumberForCase(string query);
        Task<string> PolicySearchMoreInfo(int policyId, int rolePlayerId);
        Task<int> OverAgeDailyCheckStart();
        Task<List<RolePlayerPolicy>> SearchPoliciesByRolePlayerForCase(int rolePlayerId);
        Task<PagedRequestResult<RolePlayerPolicy>> GetRolePlayerAmendments(int rolePlayerId, int policyId);
        Task<List<RolePlayerPolicy>> SearchPoliciesByRolePlayerForRelationsCase(int rolePlayerId, bool isMainMember);
        Task ProcessCollectionBankingDetailRejection(int? policyId, string reason, string accountNumber, string bank, string branch, string accountholder);
        Task<bool> CancelPolicy(string policyNumber);
        Task<bool> CancelPolicies();
        Task<bool> LapseTwoConsecutiveUnmetPremiums(string applicationName);
        Task<bool> LapseTwoUnpaidPremiumsOverTwoYearPeriod(string applicationName);
        Task<bool> MonitorPendingFirstPremiumPolicies(string applicationName);
        Task<bool> MonitorPendingCancellationBulkCommunication(string applicationName);
        Task<bool> IsLapseStillWithinNinetyDayWindow(int policyId);
        Task<bool> MonitorPoliciesWithOnePremiumMissed();
        Task<bool> MonitorReinstatementPayments();
        Task<bool> MonitorContinuationPayments();
        Task<bool> Monitor90DayLapse();
        Task<bool> CheckNoClaimsAgainstPolicy(int policyId);
        Task<decimal> GetTotalForOutstandingInvoices(int policyId);
        Task<decimal> GetRefundAmountBasedOnAllocationsAndTrigger(RolePlayerPolicy policy, RefundTypeEnum refundType);
        Task<List<int>> GetAllOutstandingInvoicesForPolicy(RolePlayerPolicy policy);
        Task CreateCreditNotesForOutstandingInvoices(RolePlayerPolicy policy, string reason, bool createForFirstInvoiceOnly);
        Task<decimal> CalculateAmountForMonthsEnjoyedCover(DateTime cancellationDate, DateTime policyInceptionDate, decimal installmentPremium);
        Task<List<int>> GetTotalNumberOfPoliciesOwnedByRoleplayer(int rolePlayerId);
        Task EditPolicyWizard(Case policyCase);
        Task EditGroupPolicyWizard(Case policyCase);
        Task UpdateChildPolicyPremiums(int policyId);
        Task SavePreviousInsurers(Case policyCase);
        Task<int> CreateGroupPolicyMember(RolePlayerGroupPolicy memberPolicy);
        Task<List<RolePlayerPolicy>> GetPoliciesActivatedBeforePeriod(DateTime periodStartDate);
        Task EditRolePlayerPolicy(RolePlayerPolicy policy);
        Task<bool> MonitorPoliciesWithSecondPremiumMissed(string applicationName);
        Task UpdateIndividualPolicyPremium(int policyId);
        Task UpdatePolicyPremiums(Case @case);
        Task UpdateMemberPremiumContribution(int policyId, string policyNumber, int rolePlayerId, DateTime date);
        Task<PolicyInsuredLife> RemoveInsuredLife(int rolePlayerId, int policyId, DateTime insuredLifeEndDate);
        Task<PagedRequestResult<RolePlayerPolicy>> SearchCoidPolicies(PagedRequest request);
        Task AdjustInvoicesAferClaimIsAuthorised(int policyId, int claimId);
        Task<ImportInsuredLivesSummary> UploadInsuredLives(FileContentImport content);
        Task UpdateFinPayee(int oldPolicyOwnerId, int newPolicyOwnerId);
        Task UpdateBillingTransactionRolePlayer(int oldPolicyOwnerId, int newPolicyOwnerId);
        Task<ImportInsuredLivesSummary> ImportInsuredLives(ImportInsuredLivesRequest importRequest);
        Task<RuleRequestResult> InsuredLivesImportErrors(string fileIdentifier);
        Task ChangePolicyStatus(RolePlayerPolicy policy, string reason);
        Task<ProductOption> GetPolicyProductOption(int policyId);
        Task CancelGroupPolicyChildren(int policyId, DateTime? cancelDate, PolicyCancelReasonEnum? reason);
        Task GroupPolicyCancellationReject(int policyId);
        Task MovePolicyScheme(GroupPolicy sourcePolicy, GroupPolicy targetPolicy, List<int> policyIds, int? policyMovementId, DateTime effectiveDate);
        Task SendPolicyMovedCommunications(GroupPolicy targetPolicy, List<int> policyIds, DateTime effectiveDate);
        Task<bool> HasProductDeviation(int? parentPolicyId, ProductDeviationTypeEnum productDeviationType);
        Task<int?> GetProductDeviationBenefit(int? parentPolicyId, ProductDeviationTypeEnum productDeviationType, int? benefitId);
        Task ApplyProductDeviationUpdates(GroupPolicy policy, ProductDeviationTypeEnum productDeviationType);

        Task<PolicyDocumentCommunicationMatrix> GetPolicyDocumentCommunicationMatrix(int? policyId);

    }
}
