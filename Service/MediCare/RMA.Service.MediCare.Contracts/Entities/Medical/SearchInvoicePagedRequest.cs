using RMA.Common.Entities.DatabaseQuery;

using System;
using System.Runtime.Serialization;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    [DataContract]
    public class SearchInvoicePagedRequest : PagedRequest
    {
        [DataMember]
        public string PracticeNumber { get; set; }
        [DataMember]
        public int PractitionerTypeId { get; set; }
        [DataMember]
        public int InvoiceStatusId { get; set; }
        [DataMember]
        public int SwitchBatchInvoiceStatusId { get; set; }
        [DataMember]
        public string ClaimReference { get; set; }
        [DataMember]
        public string SupplierInvoiceNumber { get; set; }
        [DataMember]
        public string AccountNumber { get; set; }
        [DataMember]
        public DateTime? InvoiceDate { get; set; }
        [DataMember]
        public DateTime? TreatmentDateFrom { get; set; }
        [DataMember]
        public DateTime? TreatmentDateTo { get; set; }
        [DataMember]
        public int PersonEventId { get; set; }

        public SearchInvoicePagedRequest(int page, int pageSize, string practiceNumber, int practitionerTypeId, int invoiceStatusId, int switchBatchInvoiceStatusId,
            string supplierInvoiceNumber, string accountNumber, DateTime? invoiceDate,
            DateTime? treatmentDateFrom, DateTime? treatmentDateTo, string claimReference)
        {
            SearchCriteria = string.Empty;
            Page = page;
            PageSize = pageSize;
            IsAscending = true;
            PracticeNumber = practiceNumber;
            PractitionerTypeId = practitionerTypeId;
            InvoiceStatusId = invoiceStatusId;
            SwitchBatchInvoiceStatusId = switchBatchInvoiceStatusId;
            SupplierInvoiceNumber = supplierInvoiceNumber;
            AccountNumber = accountNumber;
            TreatmentDateFrom = treatmentDateFrom;
            TreatmentDateTo = treatmentDateTo;
            InvoiceDate = invoiceDate;
            ClaimReference = claimReference;
        }
    }
}