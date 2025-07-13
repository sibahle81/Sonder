using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class DiscountFileListing
    {
        public int Id { get; set; } // Id (Primary key)
        public Guid FileIdentifier { get; set; } // FileIdentifier
        public string HealthCarePractitioner { get; set; } // HealthCarePractitioner (length: 150)
        public string TakPrc { get; set; } // TakPrc (length: 50)
        public string AccPer { get; set; } // AccPer (length: 50)
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public string PatientInitials { get; set; } // PatientInitials (length: 50)
        public string PatientName { get; set; } // PatientName (length: 50)
        public string MedicalAidCode { get; set; } // MedicalAidCode (length: 50)
        public string MedicalAidName { get; set; } // MedicalAidName (length: 150)
        public string MedicalAidNumber { get; set; } // MedicalAidNumber (length: 50)
        public string LosAuthCode { get; set; } // LosAuthCode (length: 50)
        public string MedicalAidPlan { get; set; } // MedicalAidPlan (length: 50)
        public string TrackingNumber { get; set; } // TrackingNumber (length: 50)
        public string SwitchRef { get; set; } // SwitchRef (length: 50)
        public string BatchNumber { get; set; } // BatchNumber (length: 50)
        public string AdmDate { get; set; } // AdmDate (length: 10)
        public string DisDate { get; set; } // DisDate (length: 10)
        public string RenDate { get; set; } // RenDate (length: 10)
        public string LastRenDate { get; set; } // LastRenDate (length: 10)
        public string DateDelivered { get; set; } // DateDelivered (length: 10)
        public string DateReceived { get; set; } // DateReceived (length: 10)
        public string DateSent { get; set; } // DateSent (length: 10)
        public string AccountTotal { get; set; } // AccountTotal (length: 10)
        public string OutstandingBalance { get; set; } // OutstandingBalance (length: 10)
        public string PharmacyTotal { get; set; } // PharmacyTotal (length: 10)
        public string ReceiptTotal { get; set; } // ReceiptTotal (length: 10)
        public string ReceiptDate { get; set; } // ReceiptDate (length: 10)
        public string ReceiptNumber { get; set; } // ReceiptNumber (length: 50)
        public string BatchNo { get; set; } // BatchNo (length: 50)
        public string BatchType { get; set; } // BatchType (length: 10)
        public string PrivateAmount { get; set; } // PrivateAmount (length: 10)
        public string BenefitAmount { get; set; } // BenefitAmount (length: 10)
        public string FinalBenefitAmount { get; set; } // FinalBenefitAmount (length: 10)
        public string PatType { get; set; } // PatType (length: 50)
        public string ArrServProvider { get; set; } // ArrServProvider (length: 50)
        public string DeliveredReceipt { get; set; } // DeliveredReceipt (length: 50)
        public string RenderedToReceipt { get; set; } // RenderedToReceipt (length: 50)
        public string LastRenderedToReceipt { get; set; } // LastRenderedToReceipt (length: 50)
        public string DateSend { get; set; } // DateSend (length: 50)
        public string DaysCalculated { get; set; } // DaysCalculated (length: 50)
        public string DiscountPercentage { get; set; } // DiscountPercentage (length: 50)
        public string Discount { get; set; } // Discount (length: 50)
        public string HcpInvoiceNumber { get; set; } // HCPInvoiceNumber (length: 50)
        public string HcpAccountNumber { get; set; } // HCPAccountNumber (length: 50)
        public string RmaInvoiceNumber { get; set; } // RMAInvoiceNumber (length: 50)
        public int? ExcelRowNumber { get; set; } // ExcelRowNumber
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate

    }
}
