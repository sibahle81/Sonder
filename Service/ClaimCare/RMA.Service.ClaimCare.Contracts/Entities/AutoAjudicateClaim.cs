using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class AutoAjudicateClaim
    {
        public int? ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public int PersonEventId { get; set; }
        public int ClaimantId { get; set; }
        public int InsuredLifeId { get; set; }
        public string ProductCode { get; set; }
        public bool IsVopdVerified { get; set; }
        public bool IsAlive { get; set; }
        public IdTypeEnum IdType { get; set; }
        public SuspiciousTransactionStatusEnum SuspiciousTransactionStatus { get; set; }
        public string EmployeeFirstName { get; set; }
        public string EmployeeSurname { get; set; }
        public CommunicationTypeEnum CommunicationType { get; set; }
        public string EmployeeEmailAddress { get; set; }
        public string EmployeeCellNumber { get; set; }
        public TitleEnum Title { get; set; }
        public DateTime EventDate { get; set; }
        public string CompanyName { get; set; }
        public string CompanyReferenceNumber { get; set; }
        public string CompanyAddressLine1 { get; set; }
        public string CompanyCity { get; set; }
        public string CompanyPostalCode { get; set; }
        public int PolicyId { get; set; }
        public bool DocumentsBeenUploaded { get; set; }
        public string CompCarePEVRefNumber { get; set; }
        public string EmployeeIdNumber { get; set; }
    }
}