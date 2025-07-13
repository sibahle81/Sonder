using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Integration.Hyphen;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface ICollectionService : IService
    {
        Task<List<Collection>> GetCollections();
        Task<Collection> GetCollection(int id);
        Task<int> AddCollection(Collection collection);
        Task EditCollection(Collection collection);
        Task AddhocCollections(List<AdhocPaymentInstruction> collections);
        Task SubmitCollection(CollectionMessage message);
        Task GenerateCollections();
        Task QueuePendingCollections(DateTime? startDate, DateTime? endDate);
        Task ProcessBankResponse(HyphenFACSResponse bankResponse);
        Task DoCollectionReconciliations();
        Task ProcessEFTPayments();
        Task<bool> ProcessCFPPayments();
        Task<bool> AuthoriseRejectedCollection(Collection collection);
        Task<PagedRequestResult<Collection>> Get(PagedRequest request, CollectionTypeEnum? collectionType, CollectionStatusEnum? collectionStatus, DateTime? startDate, DateTime? endDate);
        Task<PagedRequestResult<Collection>> Search(PagedRequest request, int searchFilterTypeId);
        Task<Collection> QueueCollection(Collection collection, string batchReference);
        Task ProcessClaimRecoveryEFTPayments();
        Task CreateAdhocDebitOrderWizard(AdhocPaymentInstruction debitOrder);
        Task DoExternalCollectionReconcilations();
        Task GenerateCollectionsForPeriod(DateTime collectionsDate);
        Task<List<CollectionsAgeing>> GetCollectionsAgeing(int balanceTypeId, int clientTypeId, int debtorStatus, string endDate, int industryId, int productId);
        Task<int> CreateAdhocCollection(AdhocPaymentInstruction collection);
        Task ProcessDebitOrderCollectionResponse(Contracts.Integration.Hyphen.HyphenFACSResponse bankResponse);
        Task<Collection> GetCollectionByTermArrangementScheduleId(int termArrangementScheduleId);
        Task<List<AdhocPaymentInstructionsTermArrangementSchedule>> GetAdhocPaymentInstructionsTermArrangementSchedules(int termArrangementId);
        Task DoExternalLifeCollectionReconcilations();
    }
}
