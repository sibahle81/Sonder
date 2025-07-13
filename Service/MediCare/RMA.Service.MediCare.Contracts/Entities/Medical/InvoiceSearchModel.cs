using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceSearchModel
    {

        public string PracticeNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ServiceDate { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public InvoiceStatusEnum? InvoiceStatus { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int? PersonEventId { get; set; }
        public string InvoiceNumber { get; set; }
        public string HcpInvoiceNumber { get; set; }
        public string HcpAccountNumber { get; set; }

    }
}
