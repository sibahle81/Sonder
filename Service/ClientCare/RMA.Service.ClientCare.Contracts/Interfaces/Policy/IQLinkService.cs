using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Integrations.Contracts.Entities.Qlink;

using System.Collections.Generic;
using System.Threading.Tasks;

using PolicyRequestModel = RMA.Service.ClientCare.Contracts.Entities.Policy.CFP.PolicyRequest;
using PolicyRequestMvpModel = RMA.Service.ClientCare.Contracts.Entities.Policy.MVP.PolicyRequest;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IQLinkService : IService
    {
        Task<List<QlinkTransactionModel>> ProcessQlinkTransactionAsync(List<string> policyNumbers, QLinkTransactionTypeEnum qLinkTransactionType, bool checkPreviousTransaction);
        Task<PolicyRequestModel> GetPolicyDetailRequestAsync(string claimCheckReference);
        Task<PolicyRequestMvpModel> GetMvpPolicyDetailRequestAsync(string claimCheckReference); // MFT Added Request for MVP - need to move
        Task<bool> ProcessQlinkQtosTransactionAsync();
        Task<List<QlinkTransactionModel>> ProcessQlinkFailedAffordabilityCheckPolicyNumbersAsync();
        Task<List<QlinkTransactionRequest>> FetchQlinkPendingIncreaseRequests(PolicyIncreaseStatusEnum increaseStatus);
        Task<int> ProcessAnnualIncreaseTransactions(PolicyIncreaseStatusEnum increaseStatus);
        Task<bool> CheckPolicyIsActiveOnQlinkAsync(string policyNumber);
        Task<bool> ActivateQlinkReservationsAsync();
        Task<List<QlinkPolicyModel>> GetSuccessfulQLinkResultsAsync(string policyNumber);
        Task<bool> ProcessStagedQlinkTransactions();
        Task<bool> ProcessFalsePositiveQlinkTransactionMessage(QlinkTransactionResponse qlinkTransactionResponse);
        Task<PagedRequestResult<QlinkTransactionModel>> GetPagedQlinkTransactions(QlinkSearchRequest qlinkSearchRequest);
        Task<bool> LinkReservationToCorrectQaddActivation();
    }
}
