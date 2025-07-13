using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceSearchResult : AuditDetails
    {
        public int RolePlayerId { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string IdNumber { get; set; }
        public bool IsAlive { get; set; }
        public System.DateTime? DateOfDeath { get; set; }
        public string DeathCertificateNumber { get; set; }
        public bool IsVopdVerified { get; set; }
        public bool IsStudying { get; set; }
        public bool IsDisabled { get; set; }
        public string CellNumber { get; set; }
        public string EmailAddress { get; set; }
        public string PreferredCommunicationType { get; set; }
        public string Relation { get; set; }
        public int PolicyId { get; set; }
        public int? RolePlayerTypeId { get; set; }
        public int CommunicationTypeId { get; set; }
        public string PolicyNumber { get; set; }
        public string IndustryNumber { get; set; }
        public string EmployeeNumber { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal InvoiceAmount { get; set; }
        public string InvoiceStatus { get; set; }
        public InvoiceTypeEnum InvoiceType { get; set; }
        public decimal InvoiceBalance { get; set; }
        public int? SourceModuleId { get; set; }
        public int? SourceProcessId { get; set; }
    }
}
