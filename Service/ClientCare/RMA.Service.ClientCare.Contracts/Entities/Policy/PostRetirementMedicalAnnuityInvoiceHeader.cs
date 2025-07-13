using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
   public class PostRetirementMedicalAnnuityInvoiceHeader
    {
        public int PostRetirementMedicalAnnuityInvoiceHeaderId { get; set; } // PostRetirementMedicalAnnuityInvoiceHeaderId (Primary key)
        public int MedicalAidRolePlayerId { get; set; } // MedicalAidRolePlayerId
        public InvoiceStatusEnum InvoiceStatus { get; set; } // InvoiceStatusId
        public System.DateTime InvoiceDate { get; set; } // InvoiceDate
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 50)
        public int NumberLines { get; set; } // NumberLines
        public decimal TotalBillAmount { get; set; } // TotalBillAmount
        public decimal TotalPaymentAmount { get; set; } // TotalPaymentAmount
        public string ValidatedBy { get; set; } // ValidatedBy (length: 50)
        public System.DateTime? ValidatedDate { get; set; } // ValidatedDate
        public string PaymentRequestedBy { get; set; } // PaymentRequestedBy (length: 50)
        public System.DateTime? PaymentRequestedDate { get; set; } // PaymentRequestedDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string CompanyName { get; set; }
        public string CompanyBankAccountNumber { get; set; }
    }
}
