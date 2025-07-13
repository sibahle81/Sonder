using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Runtime.Serialization;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    [DataContract]
    public class SwitchBatchPagedRequest : PagedRequest
    {
        [DataMember]
        public string SwitchType { get; set; }
        [DataMember]
        public int? SwitchBatchId { get; set; }
        [DataMember]
        public string BatchNumber { get; set; }
        [DataMember]
        public DateTime? DateSubmitted { get; set; }
        [DataMember]
        public DateTime? DateSwitched { get; set; }
        [DataMember]
        public DateTime? DateReceived { get; set; }
        [DataMember]
        public int? AssignedToUserId { get; set; }
        [DataMember]
        public bool? IncludeCompletedBatches { get; set; }
        [DataMember]
        public SwitchBatchTypeEnum? SwitchBatchType { get; set; }

        public SwitchBatchPagedRequest() { }
        public SwitchBatchPagedRequest(int page, int pageSize, string switchType,
            int? switchBatchId, string batchNumber, DateTime? dateSubmitted, DateTime? dateReceived,
            DateTime? dateSwitched, int? assignedToUserId, bool? includeCompletedBatches, SwitchBatchTypeEnum? switchBatchType)
        {
            SearchCriteria = string.Empty;
            Page = page;
            PageSize = pageSize;
            IsAscending = true;
            SwitchBatchId = switchBatchId;
            SwitchType = switchType;
            BatchNumber = batchNumber;
            DateReceived = dateReceived;
            DateSubmitted = dateSubmitted;
            DateSwitched = dateSwitched;
            AssignedToUserId = assignedToUserId;
            IncludeCompletedBatches = includeCompletedBatches;
            SwitchBatchType = switchBatchType;
        }
    }
}
