using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class LeadProductMapping : CsvMapping<Load_LeadsProduct>
    {
        public LeadProductMapping()
        {
            this.MapProperty(0, s => s.LeadSource);
            this.MapProperty(1, s => s.MemberName);
            this.MapProperty(2, s => s.ClientType);
            this.MapProperty(3, s => s.CommunicationType);
            this.MapProperty(4, s => s.IsPreferredCommunication);
            this.MapProperty(5, s => s.ContactName);
            this.MapProperty(6, s => s.Contact);
            this.MapProperty(7, s => s.AddressType);
            this.MapProperty(8, s => s.AddressLine1);
            this.MapProperty(9, s => s.AddressLine2);
            this.MapProperty(10, s => s.PostalCode);
            this.MapProperty(11, s => s.Country);
            this.MapProperty(12, s => s.Province);
            this.MapProperty(13, s => s.City);
            this.MapProperty(14, s => s.NoteText);
            this.MapProperty(15, s => s.IndustryClass);
            this.MapProperty(16, s => s.IndustryType);
            this.MapProperty(17, s => s.RegistrationType);
            this.MapProperty(18, s => s.CompanyRegNo);
            this.MapProperty(19, s => s.CfReferenceNo);
            this.MapProperty(20, s => s.CfRegistrationNo);
            this.MapProperty(21, s => s.IdType);
            this.MapProperty(22, s => s.IdNumber);
            this.MapProperty(23, s => s.FirstName);
            this.MapProperty(24, s => s.Surname);
            this.MapProperty(25, s => s.Product);
            this.MapProperty(26, s => s.ProductOption);
        }
    }
}
