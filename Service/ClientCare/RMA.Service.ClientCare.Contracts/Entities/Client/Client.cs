using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class Client : AuditDetails
    {
        public int? ParentClientId { get; set; }
        public int AddressId { get; set; }
        public int IndustryId { get; set; }
        public IndustryClassEnum? IndustryClass { get; set; }
        public ClientTypeEnum ClientType { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string RegistrationNumber { get; set; }
        public string VatRegistrationNumber { get; set; }
        public string ReferenceNumber { get; set; }
        public bool? IsAuthorised { get; set; }
        public string LastName { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string TaxNumber { get; set; }
        public string Designation { get; set; }
        public int? NatureOfBusinessId { get; set; }
        public string Code { get; set; }
        public DateTime DateViewed { get; set; }

        public string ClientFullName => $"{Name?.Trim()} {LastName?.Trim()}";

        public int? GroupId { get; set; }
        public string CompensationFundNumber { get; set; }
        public string BusinessPartnerNumber { get; set; }
        public string Email { get; set; }

        public int? LeadClientId { get; set; } //Used in Wizard
        public List<int> CommunicationTypeIds { get; set; }
        public int ClientTypeId
        {
            get => (int)ClientType;
            set => ClientType = (ClientTypeEnum)value;
        }

        public int IndustryClassId
        {
            get => (int)IndustryClass.GetValueOrDefault();
            set => IndustryClass = (IndustryClassEnum)value;
        }
    }
}