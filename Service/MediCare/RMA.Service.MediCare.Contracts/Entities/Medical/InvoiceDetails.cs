using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceDetails : Invoice
    {
        public string ClaimReferenceNumber { get; set; }
        public string HealthCareProviderName { get; set; }
        public string PayeeName { get; set; }
        public string PayeeType { get; set; }
        public int PractitionerTypeId { get; set; }
        public string PractitionerTypeName { get; set; }
        public string PracticeNumber { get; set; }
        public bool IsVat { get; set; }
        public string VatRegNumber { get; set; }
        public bool GreaterThan731Days { get; set; }
        public List<InvoiceLineDetails> InvoiceLineDetails { get; set; }
        public bool IsExcludeAutoPay { get; set; }
        public DateTime? PaymentConfirmationDate { get; set; }
        public int? EventId { get; set; }
        public string BatchNumber { get; set; }
        public string InvoiceStatusDesc { get; set; }

        public SwitchInvoiceStatusEnum? SwitchInvoiceStatus { get; set; }
        public string Person { get; set; }
        public string Status { get; set; }
    }
}
