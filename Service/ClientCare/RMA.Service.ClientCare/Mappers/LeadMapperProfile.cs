using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Database.Entities;

namespace RMA.Service.ClientCare.Mappers
{
    public class LeadMapperProfile : Profile
    {
        public LeadMapperProfile()
        {
            CreateMap<lead_Lead, Lead>()
                .ReverseMap()
                .ConstructUsing(m => MapperExtensions.GetEntity<lead_Lead>(m.LeadId));

            CreateMap<lead_Address, LeadAddress>()
                .ReverseMap()
                .ForMember(m => m.Lead, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<lead_Address>(s.AddressId));

            CreateMap<lead_Company, LeadCompany>()
                .ReverseMap()
                .ForMember(m => m.Lead, opt => opt.Ignore());

            CreateMap<lead_Contact, LeadContact>()
                .ReverseMap()
                .ForMember(m => m.Lead, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<lead_Contact>(s.ContactId));

            CreateMap<lead_ContactV2, LeadContactV2>()
                .ReverseMap()
                .ForMember(m => m.Lead, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<lead_ContactV2>(s.ContactId));

            CreateMap<lead_Note, LeadNote>()
                .ReverseMap()
                .ForMember(m => m.Lead, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<lead_Note>(s.NoteId));

            CreateMap<lead_Person, LeadPerson>()
                .ReverseMap()
                .ForMember(m => m.Lead, opt => opt.Ignore());

            CreateMap<Load_LeadsUploadErrorAudit, LeadsUploadErrorAuditDetails>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<Load_LeadsUploadErrorAudit>(s.Id));

        }
    }
}
