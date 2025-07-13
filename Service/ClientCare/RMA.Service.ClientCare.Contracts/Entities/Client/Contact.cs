using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class Contact : AuditDetails
    {
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public ContactTypeEnum ContactType { get; set; }
        public string Designation { get; set; }
        public TitleEnum Title { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string TelephoneNumber { get; set; }
        public string MobileNumber { get; set; }
        public List<int> ServiceTypeIds { get; set; }
        public IndustryClassEnum IndustryClass { get; set; }
        public string RegistrationNumber { get; set; }
        public string VatRegistrationNumber { get; set; }
        public string ReferenceNumber { get; set; }
        public string IdNumber { get; set; }
        public string TaxNumber { get; set; }
        public bool HasOnlineDirector { get; set; }
        public string OnlineDirectorEmail { get; set; }
        public bool? Unsubscribe { get; set; }
        //ENUM => ID Conversions
        public int ContactTypeId
        {
            get => (int)ContactType;
            set => ContactType = (ContactTypeEnum)value;
        }
        //ENUM => ID Conversions
        public int TitleId
        {
            get => (int)Title;
            set => Title = (TitleEnum)value;
        }
        //ENUM => ID Conversions
        public int IndustryClassId
        {
            get => (int)IndustryClass;
            set => IndustryClass = (IndustryClassEnum)value;
        }
    }
}