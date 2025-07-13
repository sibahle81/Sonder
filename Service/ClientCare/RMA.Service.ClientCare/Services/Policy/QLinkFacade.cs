using AutoMapper;
using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.Integrations.Contracts.Entities.Qlink;
using RMA.Service.Integrations.Contracts.Interfaces.Qlink;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;
using PolicyRequestModel = RMA.Service.ClientCare.Contracts.Entities.Policy.CFP.PolicyRequest;
using PolicyRequestMvpModel = RMA.Service.ClientCare.Contracts.Entities.Policy.MVP.PolicyRequest;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class QLinkFacade : RemotingStatelessService, IQLinkService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IQlinkIntegrationService _qlinkIntegrationService;
        private readonly IConfigurationService _configurationService;
        private readonly IHttpClientService _httpClientService;
        private readonly ILeadTimeTrackerService _leadTimeTrackerService;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<broker_Brokerage> _brokerageRepository;

        private readonly IRepository<policy_PolicyLifeExtension> _policyLifeRepository;
        private readonly IRepository<client_QlinkTransaction> _qlinkTransactionRepository;
        private readonly IRepository<client_PersalCutOffDate> _persalCutOffDateRepository;
        private readonly IRepository<client_RolePlayerPersalDetail> _rolePlayerPersalDetailRepository;
        private readonly IRepository<client_QlinkReservationTransaction> _qlinkReservationTransactionRepository;
        private readonly IRepository<Load_QLinkPaymentRecordStaging> _qlinkPaymentRecordStagingRepository;
        private readonly IRepository<broker_Representative> _representativeRepository;

        private const string QlinkAffordabiliySuccessMessage = "QLink Error: Exact duplicate transaction";
        private const string QLinkDeductionAlreadyExist = "QLink Error: Deduction already exists";
        private const string OcpApimSubscriptionKeyHeader = "Ocp-Apim-Subscription-Key";
        private const int QlinkSuccessfullStatusCode = 200;
        private const int QlinkFailedStatusCode = 400;
        private const int StraightThroughStatusCode = 1;
        private const int NonStraightThroughStatusCode = -1;
        private const int QlinkCommunicationErrorCode = -2;
        private const int QlinkNoRequestsPermittedErrorCode = -3;
        private const int QlinkChildQaddTransactionId = 0;
        private const int defaultPayrollCode = 1;

        public QLinkFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IQlinkIntegrationService qlinkIntegrationService,
            IConfigurationService configurationService,
            ILeadTimeTrackerService leadTimeTrackerService,
            IRepository<client_Person> personRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<policy_PolicyLifeExtension> policyLifeRepository,
            IRepository<client_QlinkTransaction> qlinkTransactionRepository,
            IRepository<client_PersalCutOffDate> persalCutOffDateRepository,
            IRepository<client_RolePlayerPersalDetail> rolePlayerPersalDetailRepository,
            IRepository<broker_Brokerage> brokerageRepository,
            IRepository<client_QlinkReservationTransaction> qlinkReservationTransactionRepository,
            IRepository<Load_QLinkPaymentRecordStaging> qlinkPaymentRecordStagingRepository,
            IRepository<broker_Representative> representativeRepository,
            IHttpClientService httpClientService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _qlinkIntegrationService = qlinkIntegrationService;
            _personRepository = personRepository;
            _policyRepository = policyRepository;
            _configurationService = configurationService;
            _policyLifeRepository = policyLifeRepository;
            _qlinkTransactionRepository = qlinkTransactionRepository;
            _persalCutOffDateRepository = persalCutOffDateRepository;
            _rolePlayerPersalDetailRepository = rolePlayerPersalDetailRepository;
            _leadTimeTrackerService = leadTimeTrackerService;
            _brokerageRepository = brokerageRepository;
            _qlinkReservationTransactionRepository = qlinkReservationTransactionRepository;
            _qlinkPaymentRecordStagingRepository = qlinkPaymentRecordStagingRepository;
            _representativeRepository = representativeRepository;
            _httpClientService = httpClientService;
        }

        public async Task<int> ProcessAnnualIncreaseTransactions(PolicyIncreaseStatusEnum increaseStatus)
        {
            // Read the list of policy increases due
            var qlinkTransactionRequests = await FetchQlinkPendingIncreaseRequests(increaseStatus);
            // Send the QLink QUPD transactions
            var results = await ProcessQlinkTransactions(qlinkTransactionRequests);
            // Process the results
            if (results != null)
            {
                _ = await UpdatePolicyAffordabilityStatus(results);
                var policyIds = results.Select(x => x.ItemId).ToList();
                _ = await _leadTimeTrackerService.UpdateLeadTimeTrackerQlinkTransactionIdAsyn(policyIds);
                return results.Count;
            }
            return 0;
        }

        public async Task<List<QlinkTransactionRequest>> FetchQlinkPendingIncreaseRequests(PolicyIncreaseStatusEnum increaseStatus)
        {
            using (_dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
            {
                var requestList = await _qlinkTransactionRepository.SqlQueryAsync<QlinkTransactionRequest>(
                    DatabaseConstants.GetPolicyIncreaseDueQlinkRequestTransactions,
                    new SqlParameter { ParameterName = "@policyIncreaseStatusId", Value = (int)increaseStatus }
                );
                return requestList;
            }
        }

        public async Task<List<QlinkTransactionModel>> ProcessQlinkTransactionAsync(List<string> policyNumbers, QLinkTransactionTypeEnum qLinkTransactionType, bool checkPreviousTransaction)
        {
            try
            {
                var results = new List<QlinkTransactionModel>();
                if (policyNumbers?.Count > 0)
                {
                    var qlinkTransactionRequests = await FetchQlinkTransactionRequestAsync(policyNumbers, qLinkTransactionType);

                    results = checkPreviousTransaction
                        ? await ProcessQlinkNonStraightThroughTransactionAsync(qlinkTransactionRequests)
                        : await ProcessQlinkTransactions(qlinkTransactionRequests);
                }
                return results;
            }
            catch (Exception ex)
            {
                ex.LogException("Process Qlink Transactions");
                throw;
            }
        }

        private async Task<List<QlinkTransactionModel>> ProcessQlinkNonStraightThroughTransactionAsync(List<QlinkTransactionRequest> qlinkTransactionRequests)
        {
            var resultsList = new List<QlinkTransactionModel>();
            if (qlinkTransactionRequests.Any())
            {
                foreach (var transactionGroup in qlinkTransactionRequests.GroupBy(x => x.TransactionType).ToList())
                {
                    switch (transactionGroup.Key)
                    {
                        case QLinkTransactionTypeEnum.QADD:
                            var qaddResults = await ProcessQlinkQaddTransactions(transactionGroup.ToList(), QLinkTransactionTypeEnum.QADD);
                            if (qaddResults != null)
                            {
                                resultsList.AddRange(qaddResults);
                            }
                            break;
                        case QLinkTransactionTypeEnum.QUPD:
                            var qupdResults = await ProcessQlinkQupdTransactions(transactionGroup.ToList(), QLinkTransactionTypeEnum.QUPD);
                            if (qupdResults != null)
                            {
                                resultsList.AddRange(qupdResults);
                            }
                            break;
                        case QLinkTransactionTypeEnum.QDEL:
                            var qdelResults = await ProcessQlinkQdelTransactions(transactionGroup.ToList(), QLinkTransactionTypeEnum.QDEL);
                            if (qdelResults != null)
                            {
                                resultsList.AddRange(qdelResults);
                            }
                            break;
                        case QLinkTransactionTypeEnum.QAFA:
                        case QLinkTransactionTypeEnum.QAFU:
                            var qafaResults = await ProcessQlinkQafaTransactions(transactionGroup.ToList());
                            if (qafaResults != null)
                            {
                                resultsList.AddRange(qafaResults);
                            }
                            break;
                        default:
                            var otherResults = await ProcessQlinkTransactions(transactionGroup.ToList());
                            if (otherResults != null)
                            {
                                resultsList.AddRange(otherResults);
                            }
                            break;
                    }
                }
            }
            return resultsList;
        }

        private async Task<List<QlinkTransactionModel>> ProcessQlinkQaddTransactions(List<QlinkTransactionRequest> qlinkTransactionRequests, QLinkTransactionTypeEnum qLinkTransactionType)
        {
            Contract.Requires(qlinkTransactionRequests != null);

            var policyNumbers = qlinkTransactionRequests.Select(x => x.ReferenceNumber.Replace("X", "-")).ToList();
            qlinkTransactionRequests = await RemoveAlreadyProcessedQlinkTransactionsAsync(qlinkTransactionRequests, new List<QLinkTransactionTypeEnum> { qLinkTransactionType });
            var policyLifeExtensions = await GetPolicyLifeExtensionByPolicyNumbers(policyNumbers);
            var affordablePolicyLifeExtensionId = policyLifeExtensions.Where(x => x.AffordabilityCheckPassed).Select(x => x.PolicyId).ToList();
            var qlinkTransactionRequestsThatFailedAffordabilityCheck = qlinkTransactionRequests.Where(x => !affordablePolicyLifeExtensionId.Contains(x.ItemId)).ToList();
            var notAffordableTransactionResults = await ProcessQlinkAffordabilityTransactions(qlinkTransactionRequestsThatFailedAffordabilityCheck, qLinkTransactionType);
            var notAffordableTransactionResultIds = notAffordableTransactionResults.Select(x => x.ItemId).ToList();
            //remove transactions that have failed affordability check now and proceed with QADD for those that have passed affordability.
            qlinkTransactionRequests = qlinkTransactionRequests.Where(x => !notAffordableTransactionResultIds.Contains(x.ItemId)).ToList();

            var results = await ProcessQlinkTransactions(qlinkTransactionRequests);

            if (results != null)
            {
                _ = await UpdatePolicyAffordabilityStatus(results);
                var policyIds = results.Select(x => x.ItemId).ToList();
                _ = await _leadTimeTrackerService.UpdateLeadTimeTrackerQlinkTransactionIdAsyn(policyIds);
            }

            return results;
        }

        private async Task<List<QlinkTransactionModel>> ProcessQlinkQdelTransactions(List<QlinkTransactionRequest> qlinkTransactionRequests, QLinkTransactionTypeEnum qLinkTransactionType)
        {
            if (qlinkTransactionRequests == null) return null;
            //There's no need to process qupd/qdel if there's already a transaction processed with same details
            qlinkTransactionRequests = await RemoveAlreadyProcessedQlinkTransactionsAsync(qlinkTransactionRequests, new List<QLinkTransactionTypeEnum> { qLinkTransactionType });

            var results = await ProcessQlinkTransactions(qlinkTransactionRequests);
            return results;
        }

        private async Task<List<QlinkTransactionModel>> ProcessQlinkQupdTransactions(List<QlinkTransactionRequest> qlinkTransactionRequests, QLinkTransactionTypeEnum qLinkTransactionType)
        {
            if (qlinkTransactionRequests == null) return null;
            //There's no need to process qupd/qdel if there's already a transaction processed with same details
            qlinkTransactionRequests = await RemoveAlreadyProcessedQlinkTransactionsAsync(qlinkTransactionRequests, new List<QLinkTransactionTypeEnum> { qLinkTransactionType });

            if (qLinkTransactionType == QLinkTransactionTypeEnum.QUPD)
            {
                var transactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QADD, QLinkTransactionTypeEnum.QUPD };
                var previousSuccessfullQaddQupdTransactions = await FetchSuccessfullQlinkTransactionsAsync(qlinkTransactionRequests, transactionTypes);

                var duplicateQlinkTransactionRequestsToRemove = new List<QlinkTransactionRequest>();
                foreach (var transaction in qlinkTransactionRequests)
                {
                    if (!previousSuccessfullQaddQupdTransactions.Any(y => y.ItemId == transaction.ItemId))
                    {
                        transaction.TransactionType = QLinkTransactionTypeEnum.QADD;
                    }
                    else
                    {
                        var lastSuccessfulTrsansaction = previousSuccessfullQaddQupdTransactions.FirstOrDefault(x => x.ItemId == transaction.ItemId);
                        var deserializedTransactionRequest = JsonConvert.DeserializeObject<QlinkTransactionRequest>(lastSuccessfulTrsansaction.Request);
                        //I'm checking if a premium has changed 
                        deserializedTransactionRequest.EndDate = transaction.EndDate;
                        deserializedTransactionRequest.StartDate = transaction.StartDate;
                        deserializedTransactionRequest.SalaryMonth = transaction.SalaryMonth;
                        deserializedTransactionRequest.TransactionType = transaction.TransactionType;
                        deserializedTransactionRequest.FspNumber = transaction.FspNumber;

                        var duplicateQlinkTransactionExist = string.Equals(JsonConvert.SerializeObject(deserializedTransactionRequest),
                                                         JsonConvert.SerializeObject(transaction), StringComparison.InvariantCultureIgnoreCase);
                        if (duplicateQlinkTransactionExist)
                        {
                            duplicateQlinkTransactionRequestsToRemove.Add(transaction);
                        }
                    }
                }
                qlinkTransactionRequests = qlinkTransactionRequests.Where(y => !duplicateQlinkTransactionRequestsToRemove.Select(x => x.ItemId).ToList().Contains(y.ItemId)).ToList();
            }

            var results = await ProcessQlinkTransactions(qlinkTransactionRequests);

            if (results != null)
            {
                _ = await UpdatePolicyAffordabilityStatus(results);
                var policyIds = results.Select(x => x.ItemId).ToList();
                _ = await _leadTimeTrackerService.UpdateLeadTimeTrackerQlinkTransactionIdAsyn(policyIds);
            }

            return results;
        }

        private async Task<List<QlinkTransactionModel>> ProcessQlinkQafaTransactions(List<QlinkTransactionRequest> qlinkTransactionRequests)
        {
            var qafuTransactions = qlinkTransactionRequests.Where(y => y.TransactionType == QLinkTransactionTypeEnum.QAFU).ToList();

            //You can't reserve a Qafu if there was no qadd/qupd done before
            if (qafuTransactions.Count > 0)
            {
                var transactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QADD, QLinkTransactionTypeEnum.QUPD };
                var previousSuccessfullQaddQupdTransactions = await FetchSuccessfullQlinkTransactionsAsync(qafuTransactions, transactionTypes);

                foreach (var transaction in qlinkTransactionRequests)
                {
                    if (!previousSuccessfullQaddQupdTransactions.Any(y => y.ItemId == transaction.ItemId))
                    {
                        transaction.TransactionType = QLinkTransactionTypeEnum.QAFA;
                    }
                }
            }

            var results = await ProcessQlinkTransactions(qlinkTransactionRequests);
            if (results != null)
            {
                var successfullQafaList = results.Where(x => x.StatusCode == QlinkSuccessfullStatusCode).ToList();
                _ = await CreateQlinkReservationEntryAsync(successfullQafaList);
            }

            return results;
        }

        private async Task<bool> CreateQlinkReservationEntryAsync(List<QlinkTransactionModel> qlinkTransactionModels)
        {
            if (qlinkTransactionModels.Count == 0)
            {
                return false;
            }

            var qlinkReservationTransactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QAFA, QLinkTransactionTypeEnum.QAFU };

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyIds = qlinkTransactionModels.Select(x => x.ItemId);

                var qLinkParentTransactions = await _qlinkTransactionRepository.Where(x => policyIds.Contains(x.ItemId)
                                                && qlinkReservationTransactionTypes.Contains(x.QLinkTransactionType)
                                                && x.StatusCode == QlinkSuccessfullStatusCode).ToListAsync();

                foreach (var transactionModel in qlinkTransactionModels)
                {
                    var parentTransactionsForModels = qLinkParentTransactions.Where(x => x.ItemId == transactionModel.ItemId).ToList();

                    foreach (var parentTransactionsForModel in parentTransactionsForModels)
                    {
                        var matchFound = string.Equals(JsonConvert.SerializeObject(parentTransactionsForModel.Request),
                                                         JsonConvert.SerializeObject(transactionModel.Request), StringComparison.InvariantCultureIgnoreCase);
                        if (matchFound)
                        {
                            var existingReservations = await _qlinkReservationTransactionRepository.Where(x => x.QlinkParentTransactionId == parentTransactionsForModel.QlinkTransactionId).ToListAsync();

                            if (existingReservations.Count == 0)
                            {
                                var qlinkTransactionModel = new QlinkReservationTransactionModel
                                {
                                    QlinkParentTransactionId = parentTransactionsForModel.QlinkTransactionId,
                                    CreatedDate = DateTimeHelper.SaNow,
                                    ReservationActivated = false,
                                    CreatedBy = RmaIdentity.Email,
                                    ModifiedBy = RmaIdentity.Email,
                                    ModifiedDate = DateTimeHelper.SaNow,
                                };

                                var entity = Mapper.Map<client_QlinkReservationTransaction>(qlinkTransactionModel);
                                _qlinkReservationTransactionRepository.Create(entity);
                            }
                        }
                    }
                }

                var results = await scope.SaveChangesAsync().ConfigureAwait(false);
                return results > 0;
            }
        }

        public async Task<bool> ProcessStagedQlinkTransactions()
        {
            var currentDateTime = DateTimeHelper.SaNow;
            var qlinkStopProcessingHour = await _configurationService.GetModuleSetting(SystemSettings.QLinkStopProcessingHour);
            var qlinkDailyStartProcessingHour = await _configurationService.GetModuleSetting(SystemSettings.QlinkDailyStartProcessingHour);

            if (!string.IsNullOrEmpty(qlinkStopProcessingHour) && !string.IsNullOrEmpty(qlinkDailyStartProcessingHour))
            {
                var startTime = currentDateTime.Date.AddHours(Convert.ToInt32(qlinkStopProcessingHour));
                var endTime = startTime.Date.AddHours(Convert.ToInt32(qlinkDailyStartProcessingHour));

                if (currentDateTime > startTime && currentDateTime < endTime)
                {
                    return true;
                }
            }

            var stagedQlinkTransactions = new List<client_QlinkTransaction>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                stagedQlinkTransactions = await _qlinkTransactionRepository
                    .Where(x => x.StatusCode == StraightThroughStatusCode
                             || x.StatusCode == NonStraightThroughStatusCode)
                    .ToListAsync();
            }

            if (stagedQlinkTransactions.Count == 0)
            {
                return true;
            }

            foreach (var qLinkTransaction in stagedQlinkTransactions)
            {
                var requestEntity = JsonConvert.DeserializeObject<QlinkTransactionRequest>(qLinkTransaction.Request);
                var checkPreviousTransaction = qLinkTransaction.StatusCode != StraightThroughStatusCode;

                var resultsList = new List<QlinkTransactionModel>();
                requestEntity.QlinkTransactionId = qLinkTransaction.QlinkTransactionId;

                resultsList = await ProcessQlinkTransactions(new List<QlinkTransactionRequest> { requestEntity });

                var result = resultsList.FirstOrDefault(x => x.StatusCode == QlinkSuccessfullStatusCode || x.StatusCode == QlinkFailedStatusCode);
                if (result != null)
                {
                    qLinkTransaction.StatusCode = result.StatusCode;
                    qLinkTransaction.Response = result.Response;
                    qLinkTransaction.ModifiedDate = result.ModifiedDate;
                    qLinkTransaction.ModifiedBy = result.ModifiedBy;
                }
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var stagedQlinkTransactionIds = stagedQlinkTransactions.Select(x => x.QlinkTransactionId).ToList();
                var client_QlinkTransactions = await _qlinkTransactionRepository.Where(x => stagedQlinkTransactionIds.Contains(x.QlinkTransactionId)).ToListAsync();

                foreach (var qLinkTransaction in stagedQlinkTransactions)
                {
                    var dbClient_QlinkTransaction = client_QlinkTransactions.FirstOrDefault(x => x.QlinkTransactionId == qLinkTransaction.QlinkTransactionId);

                    if (dbClient_QlinkTransaction != null)
                    {
                        dbClient_QlinkTransaction.StatusCode = qLinkTransaction.StatusCode;
                        dbClient_QlinkTransaction.Response = qLinkTransaction.Response;
                        dbClient_QlinkTransaction.ModifiedDate = qLinkTransaction.ModifiedDate;
                        dbClient_QlinkTransaction.ModifiedBy = qLinkTransaction.ModifiedBy;

                        _qlinkTransactionRepository.Update(dbClient_QlinkTransaction);
                    }
                }

                var results = await scope.SaveChangesAsync().ConfigureAwait(true);
                return results > 0;
            }
        }


        private async Task<bool> CreateReservationForMissingQafa()
        {

            using (var scope = _dbContextScopeFactory.Create())
            {
                var reservationTransactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QAFA, QLinkTransactionTypeEnum.QAFU };

                var qafaTransactionWithMissingReservations = await (from qlinkTransaction in _qlinkTransactionRepository.Where(x => x.StatusCode == QlinkSuccessfullStatusCode && reservationTransactionTypes.Contains(x.QLinkTransactionType))
                                                                    join reservation in _qlinkReservationTransactionRepository
                                                                          on qlinkTransaction.QlinkTransactionId equals reservation.QlinkParentTransactionId into _qlinkReservationTransactionTempRepository
                                                                    from _reservation in _qlinkReservationTransactionTempRepository.DefaultIfEmpty()

                                                                    select new { qlinkTransaction, _reservation }
                                                   ).Where(y => y._reservation == null && y.qlinkTransaction != null).Select(y => new { y.qlinkTransaction }).ToListAsync();


                if (qafaTransactionWithMissingReservations.Count <= 0)
                {
                    return true;
                }

                foreach (var qafaTransactionWithMissingReservation in qafaTransactionWithMissingReservations)
                {
                    if (qafaTransactionWithMissingReservation.qlinkTransaction.QlinkTransactionId > 0)
                    {
                        var qlinkTransactionModel = new QlinkReservationTransactionModel
                        {
                            QlinkParentTransactionId = qafaTransactionWithMissingReservation.qlinkTransaction.QlinkTransactionId,
                            CreatedDate = DateTimeHelper.SaNow,
                            ReservationActivated = false,
                            CreatedBy = RmaIdentity.Email,
                            ModifiedBy = RmaIdentity.Email,
                            ModifiedDate = DateTimeHelper.SaNow,
                        };

                        var entity = Mapper.Map<client_QlinkReservationTransaction>(qlinkTransactionModel);
                        _qlinkReservationTransactionRepository.Create(entity);
                    }

                }

                return await scope.SaveChangesAsync().ConfigureAwait(true) > 0;
            }

        }

        public async Task<bool> LinkReservationToCorrectQaddActivation()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var reservationTransactionTypes = new List<QLinkTransactionTypeEnum>
             { QLinkTransactionTypeEnum.QAFA, QLinkTransactionTypeEnum.QAFU };

                var qafaTransactionWithMissingActivations =
                    await (from reservation in _qlinkReservationTransactionRepository
                           join qLinkTransaction in _qlinkTransactionRepository.Where(x =>
                            x.StatusCode == QlinkSuccessfullStatusCode &&
                            reservationTransactionTypes.Contains(x.QLinkTransactionType))
                        on reservation.QlinkParentTransactionId equals qLinkTransaction.QlinkTransactionId
                           where reservation.QlinkChildTransactionId == QlinkChildQaddTransactionId
                           select new { qLinkTransaction, reservation }
                        ).ToListAsync();


                if (qafaTransactionWithMissingActivations.Count == 0)
                {
                    return true;
                }

                foreach (var qafaTransactionWithMissingActivation in qafaTransactionWithMissingActivations)
                {
                    var activationQaddTransactionId = 0;
                    var deserializedReservationTransaction =
                        JsonConvert.DeserializeObject<QlinkTransactionRequest>(qafaTransactionWithMissingActivation
                            .qLinkTransaction.Request);
                    var reservationNumber = deserializedReservationTransaction.ReservationNumber;

                    var policyQLinkQaddTransaction = await _qlinkTransactionRepository
                        .Where(x => x.ItemId == qafaTransactionWithMissingActivation.qLinkTransaction.ItemId &&
                                    x.QLinkTransactionType == QLinkTransactionTypeEnum.QADD &&
                                    x.Request.Contains(reservationNumber) && x.CreatedDate >= qafaTransactionWithMissingActivation.reservation.CreatedDate).OrderBy(x => x.StatusCode)
                        .ToListAsync();

                    var successfulQaddActivation =
                        policyQLinkQaddTransaction.Find(x => x.StatusCode == QlinkSuccessfullStatusCode);

                    activationQaddTransactionId = successfulQaddActivation?.QlinkTransactionId ?? 0;

                    if (activationQaddTransactionId == 0)
                    {
                        var failedQaddActivation =
                            policyQLinkQaddTransaction.Find(x => x.StatusCode == QlinkFailedStatusCode);
                        activationQaddTransactionId = failedQaddActivation?.QlinkTransactionId ?? 0;
                    }

                    if (activationQaddTransactionId == 0)
                    {
                        continue;
                    }

                    qafaTransactionWithMissingActivation.reservation.QlinkChildTransactionId =
                        activationQaddTransactionId;
                    _qlinkReservationTransactionRepository.Update(qafaTransactionWithMissingActivation.reservation);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(true) > 0;
            }
        }

        public async Task<bool> ActivateQlinkReservationsAsync()
        {
            var reservationIds = new List<int>();
            List<client_QlinkTransaction> qLinkMainTransactions;
            List<client_QlinkReservationTransaction> qLinkReservationTransactions;

            _ = await CreateReservationForMissingQafa();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var reservationTransactionTypes = new List<QLinkTransactionTypeEnum>
                    { QLinkTransactionTypeEnum.QAFA, QLinkTransactionTypeEnum.QAFU };

                qLinkReservationTransactions =
                    await (from reservation in _qlinkReservationTransactionRepository.Where(x =>
                                !x.ReservationActivated && string.IsNullOrEmpty(x.Comment))
                           join qLinkTransaction in _qlinkTransactionRepository.Where(x =>
                                   x.StatusCode == QlinkSuccessfullStatusCode
                                   && reservationTransactionTypes.Contains(x.QLinkTransactionType))
                               on reservation.QlinkParentTransactionId equals qLinkTransaction.QlinkTransactionId
                           select reservation
                        ).ToListAsync();

                var parentQLinkTransactionIds = qLinkReservationTransactions.Select(y => y.QlinkParentTransactionId)
                    .Distinct().ToList();
                qLinkMainTransactions = await _qlinkTransactionRepository.Where(x =>
                    x.StatusCode == QlinkSuccessfullStatusCode && reservationTransactionTypes.Contains(
                                                                   x.QLinkTransactionType)
                                                               && parentQLinkTransactionIds.Contains(
                                                                   x.QlinkTransactionId)).ToListAsync();
            }

            foreach (var qLinkReservationTransaction in qLinkReservationTransactions)
            {

                var qLinkMainTransaction = qLinkMainTransactions.Find(x =>
                    x.QlinkTransactionId == qLinkReservationTransaction.QlinkParentTransactionId);
                if (qLinkMainTransaction == null)
                {
                    continue;
                }

                var deserializedReservationTransaction =
                    JsonConvert.DeserializeObject<QlinkTransactionRequest>(qLinkMainTransaction.Request);

                var currentCutoffDate = await GetCurrentPersalCutOfDatefAsync(deserializedReservationTransaction.PayrollId);
                var previousCutoffDate = await GetPreviousPersalCutOfDatefAsync(deserializedReservationTransaction.PayrollId);
                var qLinkStartProcessingHour =
                    await _configurationService.GetModuleSetting(SystemSettings.QLinkStartProcessingHour);
                var timeToStartProcessingRequests =
                    previousCutoffDate.CutOffDate.AddHours(Convert.ToInt32(qLinkStartProcessingHour));


                if (!string.Equals(deserializedReservationTransaction.SalaryMonth,
                        currentCutoffDate.SalaryMonth.ToString("yyyyMM"), StringComparison.CurrentCultureIgnoreCase))
                {
                    continue;
                }

                if (DateTimeHelper.SaNow < timeToStartProcessingRequests)
                {
                    continue;
                }

                deserializedReservationTransaction.TransactionType =
                    deserializedReservationTransaction.TransactionType == QLinkTransactionTypeEnum.QAFA
                        ?
                        QLinkTransactionTypeEnum.QADD
                        : deserializedReservationTransaction.TransactionType == QLinkTransactionTypeEnum.QAFU
                            ? QLinkTransactionTypeEnum.QUPD
                            : deserializedReservationTransaction.TransactionType;

                var qLinkResults = await ProcessQlinkTransactions(new List<QlinkTransactionRequest>
                    { deserializedReservationTransaction });

                if (qLinkResults?.Count == 0)
                {
                    continue;
                }

                var activateReservationResults = qLinkResults?.Find(x =>
                    x.StatusCode == QlinkSuccessfullStatusCode || x.StatusCode == QlinkFailedStatusCode);
                if (activateReservationResults == null)
                {
                    continue;
                }

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var updateEntity = await _qlinkReservationTransactionRepository.FirstOrDefaultAsync(x =>
                        x.QlinkReservationTransactionId == qLinkReservationTransaction.QlinkReservationTransactionId);

                    if (updateEntity == null)
                    {
                        continue;
                    }

                    var deserializeActivationResponse =
                        JsonConvert.DeserializeObject<QlinkTransactionResponse>(activateReservationResults
                            .Response);

                    var activationTransaction = await _qlinkTransactionRepository
                        .Where(x => x.Response == activateReservationResults.Response &&
                                    x.QLinkTransactionType == deserializeActivationResponse.TransactionType &&
                                    x.ItemId == qLinkMainTransaction.ItemId)
                        .OrderByDescending(x => x.QlinkTransactionId).FirstOrDefaultAsync();

                    updateEntity.ReservationActivated =
                        activateReservationResults.StatusCode == QlinkSuccessfullStatusCode;
                    updateEntity.QlinkChildTransactionId = activationTransaction?.QlinkTransactionId ?? QlinkChildQaddTransactionId;
                    updateEntity.Comment = activateReservationResults.StatusCode != QlinkSuccessfullStatusCode
                        ? deserializeActivationResponse.Message
                        : null;
                    _qlinkReservationTransactionRepository.Update(updateEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(true);
                }
            }

            _ = await LinkReservationToCorrectQaddActivation();

            return true;
        }


        private async Task<List<QlinkTransactionModel>> ProcessQlinkTransactions(List<QlinkTransactionRequest> qlinkTransactionRequests)
        {
            if (qlinkTransactionRequests.Count == 0)
            {
                return null;
            }

            var currentDateTime = DateTimeHelper.SaNow;
            var qLinkStartProcessingHour = await _configurationService.GetModuleSetting(SystemSettings.QLinkStartProcessingHour);
            var qLinkStopProcessingHour = await _configurationService.GetModuleSetting(SystemSettings.QLinkStopProcessingHour);

            if (!string.IsNullOrEmpty(qLinkStartProcessingHour) && !string.IsNullOrEmpty(qLinkStopProcessingHour))
            {
                var startTime = currentDateTime.Date.AddHours(Convert.ToInt32(qLinkStopProcessingHour));
                var endTime = currentDateTime.Date.AddHours(Convert.ToInt32(qLinkStartProcessingHour));

                if (currentDateTime > startTime && currentDateTime < endTime)
                {
                    var qLinkTransactionResponses = new List<QlinkTransactionModel>();

                    foreach (var qLinkTransactionRequest in qlinkTransactionRequests)
                    {
                        var payLoad = JsonConvert.SerializeObject(qLinkTransactionRequest);
                        var response = JsonConvert.SerializeObject(new QlinkTransactionResponse
                        {
                            StatusCode = StraightThroughStatusCode.ToString(),
                            TransactionType = qLinkTransactionRequest.TransactionType,
                            Message = $"Transaction submitted during closed period {startTime:dd-MM-yyyy HH:mm} -  {endTime:dd-MM-yyyy HH:mm}."
                        });

                        var qlinkTransaction = new QlinkTransactionModel
                        {
                            Request = payLoad,
                            Response = response,
                            ItemType = qLinkTransactionRequest.ItemType,
                            ItemId = qLinkTransactionRequest.ItemId,
                            StatusCode = StraightThroughStatusCode,
                            QLinkTransactionType = qLinkTransactionRequest.TransactionType,
                            CreatedBy = RmaIdentity.Email,
                            ModifiedBy = RmaIdentity.Email,
                            CreatedDate = DateTimeHelper.SaNow,
                            ModifiedDate = DateTimeHelper.SaNow,
                        };

                        qLinkTransactionResponses.Add(qlinkTransaction);

                    }
                    _ = await SavePolicyQlinkTransactionsAsync(qLinkTransactionResponses);

                    return new List<QlinkTransactionModel>();
                }
            }

            var reservationTransactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QAFA, QLinkTransactionTypeEnum.QAFU };
            var qLinkTransactionModels = await SubmitTransactionsToQlinkAsync(qlinkTransactionRequests);

            foreach (var qLinkTransactionModel in qLinkTransactionModels.Where(x => x.StatusCode != QlinkSuccessfullStatusCode))
            {
                var response = JsonConvert.DeserializeObject<QlinkTransactionResponse>(qLinkTransactionModel.Response);
                if (response == null)
                {
                    continue;
                }

                if (qLinkTransactionModel.StatusCode != QlinkFailedStatusCode)
                {
                    qLinkTransactionModel.StatusCode = StraightThroughStatusCode;
                    continue;
                }

                var responseErrorCode = response.ErrorCode?.Trim();
                var hasConverted = int.TryParse(responseErrorCode, out int errorCode);

                if (hasConverted && (errorCode == QlinkCommunicationErrorCode || errorCode == QlinkNoRequestsPermittedErrorCode))
                {
                    qLinkTransactionModel.StatusCode = StraightThroughStatusCode;
                }
            }

            var savedQlinkTransactionModels = await SavePolicyQlinkTransactionsAsync(qLinkTransactionModels);

            var qafaAndQafuRequests = savedQlinkTransactionModels.Where(x => reservationTransactionTypes.Contains(x.QLinkTransactionType)).ToList();

            if (qafaAndQafuRequests.Count <= 0)
            {
                return savedQlinkTransactionModels;

            }

            var successfulQafaList = qafaAndQafuRequests.Where(x => x.StatusCode == QlinkSuccessfullStatusCode).ToList();
            _ = await CreateQlinkReservationEntryAsync(successfulQafaList);


            return savedQlinkTransactionModels;
        }

        public async Task<List<QlinkTransactionModel>> ProcessQlinkFailedAffordabilityCheckPolicyNumbersAsync()
        {
            var policyNumbers = await GetFailedAffordabilityCheckPolicyNumbers();
            if (policyNumbers.Count == 0)
            {
                return null;
            }

            var results = await ProcessQlinkTransactionAsync(policyNumbers, QLinkTransactionTypeEnum.QADD, true);
            return results;
        }

        private async Task<List<string>> GetFailedAffordabilityCheckPolicyNumbers()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                //we only retry transactions that failed 7 days ago  
                var dateOfPast7thDay = DateTimeHelper.SaNow.AddDays(-7);
                var policyNumbers = await (from il in _policyLifeRepository.Where(x => !x.AffordabilityCheckPassed && (x.ModifiedDate <= dateOfPast7thDay))
                                           join p in _policyRepository
                                            on new { il.PolicyId } equals new { p.PolicyId }
                                           select p.PolicyNumber
                                           ).ToListAsync();
                return policyNumbers;
            }
        }

        private async Task<List<PolicyLifeExtension>> GetPolicyLifeExtensionByPolicyNumbers(List<string> policyNumbers)
        {
            List<PolicyLifeExtension> result = null;
            if (policyNumbers != null && policyNumbers.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policyLifeExtension = await (from p in _policyRepository.Where(x => policyNumbers.Contains(x.PolicyNumber))
                                                     join il in _policyLifeRepository on new { p.PolicyId } equals new { il.PolicyId }
                                                     select il
                                               ).ToListAsync();
                    result = Mapper.Map<List<PolicyLifeExtension>>(policyLifeExtension);
                }
            }
            return result;
        }

        private async Task<bool> UpdatePolicyAffordabilityStatus(List<QlinkTransactionModel> qlinkTransactionModels)
        {
            Contract.Requires(qlinkTransactionModels != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var policyIdList = qlinkTransactionModels.Select(x => x.ItemId).ToList();
                var policyLifeExtensions = await _policyLifeRepository.Where(x => policyIdList.Contains(x.PolicyId)).ToListAsync();

                foreach (var qlinkTransactionModel in qlinkTransactionModels)
                {
                    var policyLifeExtention = policyLifeExtensions.FirstOrDefault(x => x.PolicyId == qlinkTransactionModel.ItemId);
                    var successMessage = qlinkTransactionModel.Response.Contains(QlinkAffordabiliySuccessMessage) || qlinkTransactionModel.Response.Contains(QLinkDeductionAlreadyExist);

                    if (policyLifeExtention != null)
                    {
                        policyLifeExtention.AffordabilityCheckPassed = successMessage || qlinkTransactionModel.StatusCode == QlinkSuccessfullStatusCode;
                        policyLifeExtention.ModifiedDate = DateTimeHelper.SaNow;
                        policyLifeExtention.ModifiedBy = RmaIdentity.Username;
                        _policyLifeRepository.Update(policyLifeExtention);
                    }
                }
                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        private async Task<List<QlinkTransactionRequest>> ProcessQlinkAffordabilityTransactions(List<QlinkTransactionRequest> inputQlinkTransactionRequests
            , QLinkTransactionTypeEnum qLinkTransactionType)
        {
            var affordabilityTransactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QADD, QLinkTransactionTypeEnum.QANA };

            if (!affordabilityTransactionTypes.Contains(qLinkTransactionType))
            {
                return inputQlinkTransactionRequests;
            }

            inputQlinkTransactionRequests = await RemoveAlreadyProcessedQlinkTransactionsAsync(inputQlinkTransactionRequests, new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QADD });

            var outputQlinkTransactionRequests = new List<QlinkTransactionRequest>();

            if (inputQlinkTransactionRequests.Count == 0)
            {
                return outputQlinkTransactionRequests;
            }

            foreach (var transaction in inputQlinkTransactionRequests)
            {
                transaction.TransactionType = QLinkTransactionTypeEnum.QANA;
            }

            var qlinkAffordabilityResults = await SubmitTransactionsToQlinkAsync(inputQlinkTransactionRequests);

            _ = await SavePolicyQlinkTransactionsAsync(qlinkAffordabilityResults);

            _ = await UpdatePolicyAffordabilityStatus(qlinkAffordabilityResults);

            foreach (var transaction in qlinkAffordabilityResults)
            {
                if (transaction.StatusCode != QlinkSuccessfullStatusCode)
                {
                    var affordableQaddTransactions = inputQlinkTransactionRequests.Where(x => x.ItemId == transaction.ItemId).ToList();
                    foreach (var affordableQaddTransaction in affordableQaddTransactions)
                    {
                        affordableQaddTransaction.TransactionType = qLinkTransactionType;
                    }
                    outputQlinkTransactionRequests.AddRange(affordableQaddTransactions);
                }
            }

            //revert back the transaction type
            foreach (var transaction in inputQlinkTransactionRequests)
            {
                transaction.TransactionType = qLinkTransactionType;
            }

            //only return transactions that failed affordability to be filetered out when we do QADD
            return outputQlinkTransactionRequests;
        }

        private async Task<List<QlinkTransactionRequest>> RemoveAlreadyProcessedQlinkTransactionsAsync(List<QlinkTransactionRequest> inputQlinkTransactionRequest, List<QLinkTransactionTypeEnum> qLinkTransactionTypes)
        {
            Contract.Requires(inputQlinkTransactionRequest != null);

            var outputQlinkTransactionRequests = new List<QlinkTransactionRequest>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var inputQlinkTransactionRequestIds = inputQlinkTransactionRequest.Select(x => x.ItemId);

                var dbTransactions = await _qlinkTransactionRepository.Where(x => inputQlinkTransactionRequestIds.Contains(x.ItemId)
                                                      && x.ItemType == "policy"
                                                      && qLinkTransactionTypes.Contains(x.QLinkTransactionType)
                                                      && x.StatusCode == QlinkSuccessfullStatusCode
                                                      ).ToListAsync();

                if (dbTransactions.Count == 0)
                {
                    return inputQlinkTransactionRequest;
                }

                foreach (var inputTransaction in inputQlinkTransactionRequest)
                {
                    var dbTransactionsMatchList = dbTransactions.Where(x => x.ItemId == inputTransaction.ItemId).ToList();

                    if (dbTransactionsMatchList.Count == 0)
                    {
                        continue;
                    }

                    foreach (var dbTransaction in dbTransactionsMatchList)
                    {
                        var deserializedTransactionRequest = JsonConvert.DeserializeObject<QlinkTransactionRequest>(dbTransaction.Request);

                        //We should only consider other fields
                        deserializedTransactionRequest.EndDate = inputTransaction.EndDate;
                        deserializedTransactionRequest.StartDate = inputTransaction.StartDate;
                        deserializedTransactionRequest.SalaryMonth = inputTransaction.SalaryMonth;
                        deserializedTransactionRequest.FspNumber = inputTransaction.FspNumber;

                        if (qLinkTransactionTypes.Contains(QLinkTransactionTypeEnum.QUPD))
                        {
                            deserializedTransactionRequest.TransactionType = QLinkTransactionTypeEnum.QUPD;
                        }

                        var duplicateQlinkTransactionExist = string.Equals(JsonConvert.SerializeObject(deserializedTransactionRequest),
                                                         JsonConvert.SerializeObject(inputTransaction), StringComparison.InvariantCultureIgnoreCase);
                        if (!duplicateQlinkTransactionExist)
                        {
                            outputQlinkTransactionRequests.Add(inputTransaction);
                            break;
                        }
                    }
                }

                return outputQlinkTransactionRequests;
            }
        }

        private async Task<List<QlinkTransactionModel>> FetchSuccessfullQlinkTransactionsAsync(List<QlinkTransactionRequest> inputQlinkTransactionRequest, List<QLinkTransactionTypeEnum> qLinkTransactionTypes)
        {
            Contract.Requires(inputQlinkTransactionRequest != null);

            var transactionIdList = new List<QlinkTransactionModel>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var inputQlinkTransactionRequestIds = inputQlinkTransactionRequest.Select(x => x.ItemId);

                var dbTransactions = await _qlinkTransactionRepository.Where(x => inputQlinkTransactionRequestIds.Contains(x.ItemId)
                                                      && x.ItemType == "policy"
                                                      && qLinkTransactionTypes.Contains(x.QLinkTransactionType)
                                                      && x.StatusCode == QlinkSuccessfullStatusCode
                                                      ).OrderByDescending(x => x.QlinkTransactionId).ToListAsync();

                transactionIdList = Mapper.Map<List<QlinkTransactionModel>>(dbTransactions);
            }

            return transactionIdList;
        }

        private async Task<List<QlinkTransactionModel>> SubmitTransactionsToQlinkAsync(List<QlinkTransactionRequest> qlinkTransactionRequests)
        {
            List<QlinkTransactionModel> qlinkResponses = null;
            if (qlinkTransactionRequests.Any())
            {
                qlinkResponses = await _qlinkIntegrationService.SubmitQlinkTransactionRequestAsync(qlinkTransactionRequests);
            }
            return qlinkResponses;
        }

        private async Task<List<QlinkTransactionModel>> SavePolicyQlinkTransactionsAsync(List<QlinkTransactionModel> qlinkTransactionModels)
        {
            Contract.Requires(qlinkTransactionModels != null);

            using (var scope = _dbContextScopeFactory.Create())
            {

                foreach (var transactionModel in qlinkTransactionModels)
                {
                    var qlinkRequest = JsonConvert.DeserializeObject<QlinkTransactionRequest>(transactionModel.Request);
                    if (qlinkRequest.QlinkTransactionId == 0)
                    {
                        var entity = Mapper.Map<client_QlinkTransaction>(transactionModel);
                        var savedEntity = _qlinkTransactionRepository.Create(entity);
                        var savedEntityModel = Mapper.Map<QlinkTransactionModel>(savedEntity);
                    }
                    else
                    {
                        var entityToUpdate = await _qlinkTransactionRepository.FirstOrDefaultAsync(x => x.QlinkTransactionId == qlinkRequest.QlinkTransactionId);
                        if (entityToUpdate != null)
                        {
                            entityToUpdate.StatusCode = transactionModel.StatusCode;
                            entityToUpdate.Response = transactionModel.Response;
                            entityToUpdate.ModifiedBy = RmaIdentity.Email;
                            entityToUpdate.ModifiedDate = DateTimeHelper.SaNow;
                            _qlinkTransactionRepository.Update(entityToUpdate);

                        }
                        else
                        {
                            var entity = Mapper.Map<client_QlinkTransaction>(transactionModel);
                            var savedEntity = _qlinkTransactionRepository.Create(entity);

                        }
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(true);
            }

            return qlinkTransactionModels;
        }

        private async Task<client_PersalCutOffDate> GetCurrentPersalCutOfDatefAsync(int payRollTypeId)
        {
            var currentDate = DateTime.Now;
            payRollTypeId = payRollTypeId == 0 ? (int)QLinkPayrollTypeEnum.PERSAL : payRollTypeId;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cutOffDate = await _persalCutOffDateRepository.OrderBy(x => x.CutOffDate).FirstOrDefaultAsync(x => x.CutOffDate >= currentDate && (int)x.QLinkPayrollType == payRollTypeId);
                return cutOffDate;
            }
        }

        private async Task<client_PersalCutOffDate> GetPersalCutOffDateForPolicyInceptionAsync(DateTime policyInceptionDate, int payRollTypeId)
        {
            payRollTypeId = payRollTypeId == 0 ? (int)QLinkPayrollTypeEnum.PERSAL : payRollTypeId;
            var cutOffDate = new client_PersalCutOffDate();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (payRollTypeId == (int)QLinkPayrollTypeEnum.BMA)
                {
                    cutOffDate = await _persalCutOffDateRepository.OrderBy(x => x.CutOffDate).FirstOrDefaultAsync(x => x.CutOffDate >= policyInceptionDate && x.SalaryMonth >= policyInceptionDate && (int)x.QLinkPayrollType == payRollTypeId);
                }
                else
                {
                    cutOffDate = await _persalCutOffDateRepository.OrderBy(x => x.CutOffDate).FirstOrDefaultAsync(x => x.CutOffDate <= policyInceptionDate && x.SalaryMonth >= policyInceptionDate && (int)x.QLinkPayrollType == payRollTypeId);
                }

                return cutOffDate;
            }
        }

        private async Task<client_PersalCutOffDate> GetPreviousPersalCutOfDatefAsync(int payRollTypeId)
        {
            var currentDate = DateTime.Now;
            payRollTypeId = payRollTypeId == 0 ? (int)QLinkPayrollTypeEnum.PERSAL : payRollTypeId;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cutOffDate = await _persalCutOffDateRepository.OrderByDescending(x => x.CutOffDate).FirstOrDefaultAsync(x => x.CutOffDate <= currentDate && (int)x.QLinkPayrollType == payRollTypeId);
                return cutOffDate;
            }
        }

        private async Task<List<QlinkTransactionRequest>> FetchQlinkTransactionRequestAsync(
            List<string> policyNumbers,
            QLinkTransactionTypeEnum qLinkTransactionType = QLinkTransactionTypeEnum.QADD)
        {
            var qLinkTransactionRequestList = new List<QlinkTransactionRequest>();
            var details = await GetPoliciesPersalDetails(policyNumbers);

            var activePolicyStatusList = new List<PolicyStatusEnum>
            {
                PolicyStatusEnum.New,
                PolicyStatusEnum.Active,
                PolicyStatusEnum.FreeCover,
                PolicyStatusEnum.Continued,
                PolicyStatusEnum.PendingFirstPremium,
                PolicyStatusEnum.Reinstated
            };

            foreach (var detail in details)
            {
                // Some first names contain double spaces or tab characters. Get rid of those
                var firstName = (!string.IsNullOrWhiteSpace(detail.Person.FirstName))
                    ? detail.Person.FirstName.Trim().ToUpperInvariant().Replace('\t', ' ').Replace("  ", " ")
                    : String.Empty;
                var initials = (!string.IsNullOrEmpty(firstName))
                    ? string.Concat(firstName.Split(' ').Select(z => z.Substring(0, 1)))
                    : String.Empty;

                var qLinkTransactionRequest = new QlinkTransactionRequest
                {
                    FspNumber = detail.Brokerage.FspNumber,
                    ItemType = "Policy",
                    ItemId = detail.Policy.PolicyId,
                    Amount = detail.Policy.InstallmentPremium,
                    IDNumber = detail.Person.IdNumber,
                    DeductionType = QlinkDeductionCode.InsuranceFuneral,
                    EmployeeNumber = detail.PersalDetail.PersalNumber,
                    Initials = initials,
                    ReferenceNumber = detail.Policy.PolicyNumber.Replace("-", "X"),
                    Surname = detail.Person.Surname.ToUpperInvariant(),
                    TransactionType = qLinkTransactionType,
                    PayrollId = !string.IsNullOrEmpty(detail.PersalDetail.PayrollCode) ? Convert.ToInt32(detail.PersalDetail.PayrollCode.Trim()) : defaultPayrollCode,
                    IntermediaryID = detail.BrokerageRepresentative.IdNumber
                };

                var currentCutOffSalaryDate = await GetCurrentPersalCutOfDatefAsync(qLinkTransactionRequest.PayrollId);

                if (activePolicyStatusList.Contains(detail.Policy.PolicyStatus))
                {
                    if ((qLinkTransactionType == QLinkTransactionTypeEnum.QADD
                            || qLinkTransactionType == QLinkTransactionTypeEnum.QUPD)
                            && detail.Policy.PolicyInceptionDate != null
                            && detail.Policy.PolicyInceptionDate.Value <= currentCutOffSalaryDate.SalaryMonth)
                    {
                        qLinkTransactionRequest.StartDate = currentCutOffSalaryDate.SalaryMonth.ToString("yyyyMMdd");
                        qLinkTransactionRequest.SalaryMonth = currentCutOffSalaryDate.SalaryMonth.ToString("yyyyMM");
                        qLinkTransactionRequest.EndDate = null;
                        qLinkTransactionRequestList.Add(qLinkTransactionRequest);
                    }
                    else if ((qLinkTransactionType == QLinkTransactionTypeEnum.QADD
                           || qLinkTransactionType == QLinkTransactionTypeEnum.QUPD
                           || qLinkTransactionType == QLinkTransactionTypeEnum.QAFA
                           || qLinkTransactionType == QLinkTransactionTypeEnum.QAFU)
                           && detail.Policy.PolicyInceptionDate != null
                           && detail.Policy.PolicyInceptionDate.Value > currentCutOffSalaryDate.SalaryMonth)
                    {
                        var firstDayMonth = new DateTime(detail.Policy.PolicyInceptionDate.Value.Year, detail.Policy.PolicyInceptionDate.Value.Month, 1);
                        var cutOffDateForPolicyInception = await GetPersalCutOffDateForPolicyInceptionAsync(firstDayMonth, qLinkTransactionRequest.PayrollId);
                        qLinkTransactionRequest.StartDate = cutOffDateForPolicyInception.SalaryMonth.ToString("yyyyMMdd");
                        qLinkTransactionRequest.SalaryMonth = cutOffDateForPolicyInception.SalaryMonth.ToString("yyyyMM");
                        qLinkTransactionRequest.EndDate = null;
                        qLinkTransactionRequest.TransactionType = qLinkTransactionType == QLinkTransactionTypeEnum.QADD ? QLinkTransactionTypeEnum.QAFA :
                            qLinkTransactionType == QLinkTransactionTypeEnum.QUPD ? QLinkTransactionTypeEnum.QAFU
                            : qLinkTransactionType;
                        qLinkTransactionRequestList.Add(qLinkTransactionRequest);
                    }
                }

                if (qLinkTransactionType == QLinkTransactionTypeEnum.QDEL)
                {
                    qLinkTransactionRequest.StartDate = null;
                    qLinkTransactionRequest.SalaryMonth = currentCutOffSalaryDate.SalaryMonth.ToString("yyyyMM");
                    qLinkTransactionRequest.EndDate = DateTimeHelper.EndOfTheMonth(currentCutOffSalaryDate.CutOffDate).ToString("yyyyMMdd");
                    qLinkTransactionRequestList.Add(qLinkTransactionRequest);
                }
            }

            return qLinkTransactionRequestList;
        }

        public async Task<PolicyRequestModel> GetPolicyDetailRequestAsync(string claimCheckReference)
        {
            var cfpRequestApiUrl = await _configurationService.GetModuleSetting(SystemSettings.CfpRequestApiUrl);
            var cfpSubscriptionKey = await _configurationService.GetModuleSetting(SystemSettings.CfpOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, cfpSubscriptionKey);

            using (var data = new StringContent(string.Empty, Encoding.UTF8, "application/json"))
            {
                var responseMessage = await _httpClientService.GetAsync(httpClientSettings, $"{cfpRequestApiUrl}{claimCheckReference}");
                var responseString = await responseMessage.Content.ReadAsStringAsync();
                var resultString = JsonConvert.DeserializeObject<string>(responseString);

                if (string.IsNullOrEmpty(resultString))
                {
                    throw new Exception($"{nameof(GetPolicyDetailRequestAsync)} : {nameof(claimCheckReference)}: {claimCheckReference}, {nameof(responseString)} : {responseString}");
                }

                var policyRequestObject = JsonConvert.DeserializeObject<PolicyRequestModel>(resultString);

                return policyRequestObject;
            }
        }

        public async Task<PolicyRequestMvpModel> GetMvpPolicyDetailRequestAsync(string claimCheckReference)
        {
            var mvpRequestApiUrl = await _configurationService.GetModuleSetting(SystemSettings.MvpRequestApiUrl);
            var mvpSubscriptionKey = await _configurationService.GetModuleSetting(SystemSettings.MvpOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, mvpSubscriptionKey);

            using (var data = new StringContent(string.Empty, Encoding.UTF8, "application/json"))
            {
                var responseMessage = await _httpClientService.GetAsync(httpClientSettings, $"{mvpRequestApiUrl}{claimCheckReference}");
                var responseString = await responseMessage.Content.ReadAsStringAsync();
                var resultString = JsonConvert.DeserializeObject<string>(responseString);

                if (string.IsNullOrEmpty(resultString))
                {
                    throw new Exception($"{nameof(GetMvpPolicyDetailRequestAsync)} : {nameof(claimCheckReference)}: {claimCheckReference}, {nameof(responseString)} : {responseString}");
                }
                var policyRequestObject = JsonConvert.DeserializeObject<PolicyRequestMvpModel>(resultString);

                return policyRequestObject;
            }
        }

        public async Task<List<PolicyPersalDetail>> GetPoliciesPersalDetails(List<string> policyNumbers)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entityList = await (from policy in _policyRepository.Where(x => policyNumbers.Contains(x.PolicyNumber))
                                        join person in _personRepository on policy.PolicyOwnerId equals person.RolePlayerId
                                        join brokerage in _brokerageRepository on policy.BrokerageId equals brokerage.Id
                                        join persalDetail in _rolePlayerPersalDetailRepository on person.RolePlayerId equals persalDetail.RolePlayerId
                                        join representative in _representativeRepository on policy.RepresentativeId equals representative.Id

                                        select new { person, policy, persalDetail, brokerage, representative })
                                        .Distinct()
                                        .GroupBy(x => x.persalDetail.PersalNumber)
                                        .Select(x => x.ToList().FirstOrDefault())
                                        .ToListAsync();

                Contract.Ensures(entityList != null && entityList.Count > 0);

                return entityList.Select(entity => new PolicyPersalDetail
                {
                    Person = Mapper.Map<Person>(entity.person),
                    Policy = Mapper.Map<PolicyModel>(entity.policy),
                    Brokerage = Mapper.Map<Brokerage>(entity.brokerage),
                    PersalDetail = Mapper.Map<PersalDetail>(entity.persalDetail),
                    BrokerageRepresentative = Mapper.Map<RepresentativeModel>(entity.representative)
                }).ToList();
            }
        }

        public async Task<bool> CheckPolicyIsActiveOnQlinkAsync(string policyNumber)
        {
            var qlinkPersalPolicyStatusApiUrl = await _configurationService.GetModuleSetting(SystemSettings.QlinkPersalPolicyStatusApiUrl);
            var qlinkSubscriptionKey = await _configurationService.GetModuleSetting(SystemSettings.QlinkOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, qlinkSubscriptionKey);

            using (var data = new StringContent(string.Empty, Encoding.UTF8, "application/json"))
            {
                var responseMessage = await _httpClientService.GetAsync(httpClientSettings, $"{qlinkPersalPolicyStatusApiUrl}{policyNumber}");
                var responseString = await responseMessage.Content.ReadAsStringAsync();
                var resultString = JsonConvert.DeserializeObject<string>(responseString);

                return resultString.IndexOf("active", StringComparison.InvariantCultureIgnoreCase) >= 0;
            }
        }

        public async Task<bool> ProcessQlinkQtosTransactionAsync()
        {
            var qLinkTransactionTypes = new List<string> { nameof(QLinkTransactionTypeEnum.QTOD), nameof(QLinkTransactionTypeEnum.QTOT), nameof(QLinkTransactionTypeEnum.QTOL), nameof(QLinkTransactionTypeEnum.QTOR), nameof(QLinkTransactionTypeEnum.QTOS) };
            var qlinkTransactionModels = new List<QlinkTransactionModel>();

            var transactionIdList = new List<QlinkTransactionModel>();
            var results = true;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var qlinkPaymentRecords = _qlinkPaymentRecordStagingRepository
                    .Where(y => !y.ImportedToQlinkTransactionTable && qLinkTransactionTypes.Contains(y.OperationType))
                    .Take(150)
                    .ToList();

                foreach (var record in qlinkPaymentRecords)
                {
                    QLinkTransactionTypeEnum qlinkTransactioType;
                    _ = Enum.TryParse(record.OperationType, out qlinkTransactioType);

                    var qlinkTransactionRequest = new QlinkTransactionRequest
                    {
                        FspNumber = "",
                        ItemType = "Policy",
                        ItemId = Convert.ToInt32(record.ReferenceNumber.Split('X')[2]),
                        Amount = record.Amount / 100.00M,
                        IDNumber = record.IdNumber,
                        DeductionType = QlinkDeductionCode.InsuranceFuneral,
                        EmployeeNumber = record.EmployeeNumber,
                        Initials = record.Initials,
                        ReferenceNumber = record.ReferenceNumber,
                        Surname = record.Surname,
                        TransactionType = qlinkTransactioType,
                        StartDate = record.SalaryMonth,
                        SalaryMonth = record.SalaryMonth,
                        EndDate = record.EndDate,
                        CorrectedReferenceNumber = Guid.NewGuid().ToString()
                    };

                    string payLoad = JsonConvert.SerializeObject(qlinkTransactionRequest);

                    var qlinkTransaction = new QlinkTransactionModel
                    {
                        Request = payLoad,
                        Response = payLoad,
                        ItemType = qlinkTransactionRequest.ItemType,
                        ItemId = qlinkTransactionRequest.ItemId,
                        StatusCode = QlinkSuccessfullStatusCode,
                        QLinkTransactionType = qlinkTransactionRequest.TransactionType,
                        CreatedBy = RmaIdentity.Email,
                        ModifiedBy = RmaIdentity.Email,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedDate = DateTimeHelper.SaNow,
                    };

                    record.ImportedToQlinkTransactionTable = true;
                    _qlinkPaymentRecordStagingRepository.Update(record);

                    qlinkTransactionModels.Add(qlinkTransaction);

                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            if (qlinkTransactionModels.Count > 0)
            {
                var qlinkTransactions = await SavePolicyQlinkTransactionsAsync(qlinkTransactionModels);
                results = qlinkTransactions.Count > 0;
            }

            return results;
        }

        public async Task<List<QlinkPolicyModel>> GetSuccessfulQLinkResultsAsync(string policyNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (from policy in _policyRepository.Where(x => x.PolicyNumber == policyNumber)
                              join qLinkTransaction in _qlinkTransactionRepository
                                  on policy.PolicyId equals qLinkTransaction.ItemId
                              where qLinkTransaction.ItemType == "policy"
                                    && qLinkTransaction.StatusCode == QlinkSuccessfullStatusCode
                              select new QlinkPolicyModel
                              {
                                  StatusCode = qLinkTransaction.StatusCode,
                                  CreatedBy = qLinkTransaction.CreatedBy,
                                  CreatedDate = qLinkTransaction.CreatedDate,
                                  IsDeleted = qLinkTransaction.IsDeleted,
                                  ItemId = qLinkTransaction.ItemId,
                                  ItemType = qLinkTransaction.ItemType,
                                  ModifiedBy = qLinkTransaction.ModifiedBy,
                                  ModifiedDate = qLinkTransaction.ModifiedDate,
                                  PolicyPremium = policy.InstallmentPremium,
                                  QlinkTransactionId = qLinkTransaction.QlinkTransactionId,
                                  QLinkTransactionType = qLinkTransaction.QLinkTransactionType,
                                  Request = qLinkTransaction.Request,
                                  Response = qLinkTransaction.Response,
                                  PolicyNumber = policy.PolicyNumber,
                                  PolicyStatus = policy.PolicyStatus
                              }).OrderByDescending(x => x.QlinkTransactionId).ToListAsync();
            }
        }

        public async Task<bool> ProcessFalsePositiveQlinkTransactionMessage(QlinkTransactionResponse qlinkTransactionResponse)
        {
            if (qlinkTransactionResponse == null)
            {
                return true;
            }

            var qlinkTransactionModel = new QlinkTransactionModel
            {
                Request = JsonConvert.SerializeObject(qlinkTransactionResponse),
                Response = JsonConvert.SerializeObject(qlinkTransactionResponse),
                ItemType = "Policy",
                ItemId = Convert.ToInt32(qlinkTransactionResponse.ReferenceNumber.Split('X')[2]),
                StatusCode = Convert.ToInt32(qlinkTransactionResponse.StatusCode),
                QLinkTransactionType = qlinkTransactionResponse.TransactionType,
                CreatedBy = RmaIdentity.Email,
                ModifiedBy = RmaIdentity.Email,
                CreatedDate = DateTimeHelper.SaNow,
                ModifiedDate = DateTimeHelper.SaNow,
                IsFalsePositive = true
            };

            var results = await SavePolicyQlinkTransactionsAsync(new List<QlinkTransactionModel> { qlinkTransactionModel });
            _ = await UpdatePolicyAffordabilityStatus(new List<QlinkTransactionModel> { qlinkTransactionModel });

            return results.Count > 0;
        }

        public async Task<PagedRequestResult<QlinkTransactionModel>> GetPagedQlinkTransactions(QlinkSearchRequest qlinkSearchRequest)
        {
            Contract.Requires(qlinkSearchRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _qlinkTransactionRepository.AsQueryable();


                query = query.Where(r => r.ItemType == qlinkSearchRequest.ItemType && r.ItemId == qlinkSearchRequest.ItemId);

                var qLinkTransactions = await query.ToPagedResult(qlinkSearchRequest.PagedRequest);
                var data = Mapper.Map<List<QlinkTransactionModel>>(qLinkTransactions.Data);
                return new PagedRequestResult<QlinkTransactionModel>
                {
                    Page = qlinkSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(qLinkTransactions.RowCount / (double)qlinkSearchRequest.PagedRequest.PageSize),
                    RowCount = qLinkTransactions.RowCount,
                    PageSize = qlinkSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }
    }
}