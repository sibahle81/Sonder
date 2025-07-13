using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalInvoiceSearchBatchCriteria
    {
        public string SwitchTypes { get; set; }
        public int? SwitchBatchId { get; set; }
        public string BatchNumber { get; set; }
        public DateTime? DateSubmitted { get; set; }
        public DateTime? DateSwitched { get; set; }
        public DateTime? DateRecieved { get; set; }
        public int? AssignedToUserId { get; set; }
        public bool? IsCompleteBatches { get; set; }
        public SwitchBatchTypeEnum? SwitchBatchType { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }
}
