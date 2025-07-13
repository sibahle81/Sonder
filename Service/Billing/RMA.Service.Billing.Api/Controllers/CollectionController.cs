using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Api.Controllers
{
    public class CollectionController : RmaApiController
    {
        private readonly ICollectionService _collectionService;

        public CollectionController(ICollectionService collectionService)
        {
            _collectionService = collectionService;
        }

        [HttpPost("SubmitPendingCollections")]
        public async Task<ActionResult> SubmitPendingPayments(DateTime startDate, DateTime endDate)
        {
            await _collectionService.QueuePendingCollections(startDate, endDate);
            return Ok();
        }

        [HttpGet("GetCollections")]
        public async Task<ActionResult<PagedRequestResult<Collection>>> Get(DateTime startDate, DateTime endDate,
            int page = 1, int pageSize = 25, string orderBy = "CreatedDate", string sortDirection = "asc",
            CollectionTypeEnum? collectionType = null, CollectionStatusEnum? collectionStatus = null)
        {
            var collections = await _collectionService.Get(new PagedRequest(string.Empty, page, pageSize, orderBy, sortDirection == "asc"), collectionType, collectionStatus, startDate, endDate);
            return Ok(collections);
        }

        [HttpGet("GetCollection/ByTermArrangementSchedule/{termArrangementScheduleId}")]
        public async Task<ActionResult<Collection>> GetCollectionByTermArrangementScheduleId(int termArrangementScheduleId)
        {
            var collection = await _collectionService.GetCollectionByTermArrangementScheduleId(termArrangementScheduleId);
            return Ok(collection);
        }

        [HttpGet("GetAdhocPaymentInstructionsTermArrangementSchedules/ByTermArrangementId/{termArrangementId}")]
        public async Task<ActionResult<List<AdhocPaymentInstructionsTermArrangementSchedule>>> GetAdhocPaymentInstructionsTermArrangementSchedulesByTermArrangementId(int termArrangementId)
        {
            var result = await _collectionService.GetAdhocPaymentInstructionsTermArrangementSchedules(termArrangementId);
            return Ok(result);
        }

        [HttpGet("Search/{query}/{searchFilterTypeId}/{page}/{pageSize}/{orderBy}/{sortDirection}")]
        public async Task<ActionResult<PagedRequestResult<Collection>>> Search(string query, int searchFilterTypeId, int page = 1, int pageSize = 25, string orderBy = "CreatedDate", string sortDirection = "asc")
        {
            var searchResults = await _collectionService.Search(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), searchFilterTypeId);
            return Ok(searchResults);
        }

        [HttpPut("SubmitCollection")]
        public async Task<ActionResult<Collection>> SubmitCollection([FromBody] Collection collection)
        {
            var result = await _collectionService.QueueCollection(collection, string.Empty);
            return Ok(result);
        }

        [HttpGet("GetCollectionsAgeing/{balanceTypeId}/{clientTypeId}/{debtorStatus}/{endDate}/{industryId}/{productId}")]
        public async Task<ActionResult<IEnumerable<CollectionsAgeing>>> GetCollectionsAgeing(int balanceTypeId, int clientTypeId, int debtorStatus, string endDate, int industryId, int productId)
        {
            List<CollectionsAgeing> collections = await _collectionService.GetCollectionsAgeing(balanceTypeId, clientTypeId, debtorStatus, endDate, industryId, productId);
            return Ok(collections);
        }

        [HttpGet("ProcessCFPPayments")]
        public async Task<ActionResult<bool>> ProcessCFPPayments()
        {
            await _collectionService.ProcessCFPPayments();
            return Ok(true);
        }

        [HttpPost("CreateAdhocDebit")]
        public async Task<ActionResult<int>> CreateAdhocDebit([FromBody] AdhocPaymentInstruction request)
        {
            var result = await _collectionService.CreateAdhocCollection(request);
            return Ok(result);
        }
    }
}
