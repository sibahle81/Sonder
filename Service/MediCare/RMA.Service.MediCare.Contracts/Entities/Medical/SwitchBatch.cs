using RMA.Common.Entities;
using System.Collections.Generic;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatch : AuditDetails
    {
        public int SwitchBatchId { get; set; }
        public int SwitchId { get; set; }
        public string Description { get; set; }
        public string SwitchBatchNumber { get; set; }
        public string SwitchFileName { get; set; }
        public System.DateTime? DateSubmitted { get; set; }
        public System.DateTime? DateSwitched { get; set; }
        public System.DateTime? DateReceived { get; set; }
        public System.DateTime? DateCompleted { get; set; }
        public decimal InvoicesStated { get; set; }
        public decimal InvoicesCounted { get; set; }
        public decimal AmountStatedInclusive { get; set; }
        public decimal AmountCountedInclusive { get; set; }
        public decimal AmountProcessed { get; set; }
        public SwitchBatchTypeEnum? SwitchBatchType { get; set; }
        public int? AssignedUserId { get; set; }
        public System.DateTime? DateCaptured { get; set; }
        public decimal LinesStated { get; set; }
        public decimal LinesCounted { get; set; }
        public int? AssignedToRoleId { get; set; }
        public bool? IsProcessed { get; set; }
        public List<SwitchBatchInvoice> SwitchBatchInvoices { get; set; }
        public string AssignedUser { get; set; }
        public int InvoicesProcessed { get; set; }
    }
}
