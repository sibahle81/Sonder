using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoice : AuditDetails
    {
        public int SwitchBatchInvoiceId { get; set; }
        public int SwitchBatchId { get; set; }
        public int? InvoiceId { get; set; }
        public int? BatchSequenceNumber { get; set; }
        public string SwitchBatchNumber { get; set; }
        public string SwitchTransactionNumber { get; set; }
        public string PracticeNumber { get; set; }
        public string HealthCareProviderName { get; set; }
        public System.DateTime? InvoiceDate { get; set; }
        public System.DateTime? DateSubmitted { get; set; }
        public System.DateTime? DateReceived { get; set; }
        public string SpInvoiceNumber { get; set; }
        public string SpAccountNumber { get; set; }
        public decimal? TotalInvoiceAmount { get; set; }
        public decimal? TotalInvoiceVat { get; set; }
        public decimal? TotalInvoiceAmountInclusive { get; set; }
        public System.DateTime? DateAdmitted { get; set; }
        public System.DateTime? DateDischarged { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public System.DateTime? EventDate { get; set; }
        public string Surname { get; set; }
        public string FirstName { get; set; }
        public string Initials { get; set; }
        public System.DateTime? DateOfBirth { get; set; }
        public string IdNumber { get; set; }
        public string CompanyNumber { get; set; }
        public string PreAuthNumber { get; set; }
        public int? PossiblePersonEventId { get; set; }
        public int? PossibleEventId { get; set; }
        public int? HealthCareProviderId { get; set; }
        public int? PreAuthId { get; set; }
        public bool? IsProcessed { get; set; }
        public string TreatingDocBhf { get; set; }
        public string EmployerName { get; set; }
        public string ReferringDocBhf { get; set; }
        public string ReferredTo { get; set; }
        public string HospitalIndicator { get; set; }
        public string SurgeonBhfNumber { get; set; }
        public string AnaesthetistBhfNumber { get; set; }
        public string AssistantBhfNumber { get; set; }
        public string LengthOfStay { get; set; }
        public string FreeTextDiagnosis { get; set; }
        public string IodReference { get; set; }
        public string PatientGender { get; set; }
        public string DiagnosticCodeType { get; set; }
        public string DisciplineCode { get; set; }
        public int? ClaimId { get; set; }
        public string ClaimReferenceNumberMatch { get; set; }
        public List<SwitchBatchInvoiceLine> SwitchBatchInvoiceLines { get; set; }
        public List<SwitchBatchInvoiceUnderAssessReason> SwitchBatchInvoiceUnderAssessReasons { get; set; }
        public List<InvoiceUnderAssessReason> MedicalInvoiceUnderAssessReasons { get; set; }
        public SwitchInvoiceStatusEnum? SwitchInvoiceStatus { get; set; }
        public string ActiveUnderAssessReason { get; set; }
        public string Status { get; set; }
        public string EmployeeNumber { get; set; }
        public string ReinstateReason { get; set; }
        public SwitchBatchTypeEnum? SwitchBatchType { get; set; } // SwitchBatchTypeId
    }
}
