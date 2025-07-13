using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Database.Entities;

namespace RMA.Service.Admin.CampaignManager.Mappers
{
    public class CampaignManagerMappingProfile : Profile
    {
        public CampaignManagerMappingProfile()
        {
            CreateMap<campaign_Campaign, Campaign>()
                .ForMember(s => s.DateViewed, opt => opt.Ignore())
                .ForMember(s => s.TargetAudiences, opt => opt.Ignore())
                .ForMember(s => s.CampaignEmails, opt => opt.Ignore())
                .ForMember(s => s.CampaignSmses, opt => opt.Ignore())
                .ForMember(s => s.Note, opt => opt.Ignore())
                .ForMember(s => s.WeekEnding, opt => opt.Ignore())
                .ForMember(s => s.CollectionDate, opt => opt.Ignore())
                .ForMember(s => s.CollectionAmount, opt => opt.Ignore())
                .ForMember(s => s.PhoneNumber, opt => opt.Ignore())
                .ForMember(s => s.EmailAddress, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_Campaign>(s.Id));

            CreateMap<campaign_Email, Email>()
                .ForMember(s => s.Tokens, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_Email>(s.Id));

            CreateMap<campaign_EmailTemplate, EmailTemplate>()
                .ForMember(s => s.Subject, opt => opt.Ignore())
                .ForMember(s => s.DateViewed, opt => opt.Ignore())
                .ForMember(s => s.CampaignTemplateType, opt => opt.Ignore())
                .ForMember(s => s.TemplateTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_EmailTemplate>(s.Id));

            CreateMap<campaign_EmailToken, EmailToken>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_EmailToken>(s.Id));

            CreateMap<campaign_ImportFile, ImportFile>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_ImportFile>(s.Id));

            CreateMap<campaign_Note, Note>()
                .ForMember(s => s.Reason, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_Note>(s.Id));

            CreateMap<campaign_Reminder, Reminder>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_Reminder>(s.Id));

            CreateMap<campaign_Sm, Sms>()
                .ForMember(s => s.Tokens, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_Sm>(s.Id));

            CreateMap<campaign_SmsTemplate, SmsTemplate>()
                .ForMember(s => s.DateViewed, opt => opt.Ignore())
                .ForMember(s => s.CampaignTemplateType, opt => opt.Ignore())
                .ForMember(s => s.TemplateTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_SmsTemplate>(s.Id));

            CreateMap<campaign_SmsToken, SmsToken>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_SmsToken>(s.Id));

            CreateMap<campaign_TargetAudience, TargetAudience>()
                .ForMember(s => s.Name, opt => opt.Ignore())
                .ForMember(s => s.ClientTypeId, opt => opt.Ignore())
                .ForMember(s => s.IdNumber, opt => opt.Ignore())
                .ForMember(s => s.MemberNumber, opt => opt.Ignore())
                .ForMember(s => s.RegistrationNumber, opt => opt.Ignore())
                .ForMember(s => s.Email, opt => opt.Ignore())
                .ForMember(s => s.MobileNumber, opt => opt.Ignore())
                .ForMember(s => s.UnsubscribedAll, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_TargetAudience>(s.Id));

            CreateMap<campaign_TargetCompany, TargetCompany>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_TargetCompany>(s.Id));

            CreateMap<campaign_TargetPerson, TargetPerson>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_TargetPerson>(s.Id));

            CreateMap<campaign_TargetAudienceMember, TargetAudienceMember>()
                .ForMember(s => s.AllowEmail, opt => opt.Ignore())
                .ForMember(s => s.AllowPhone, opt => opt.Ignore())
                .ForMember(s => s.AllowSms, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_TargetAudienceMember>(s.Id));

            CreateMap<campaign_SmsAudit, SmsAudit>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_SmsAudit>(s.Id));

            CreateMap<campaign_EmailAuditAttachment, EmailAuditAttachment>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_EmailAuditAttachment>(s.Id));

            CreateMap<campaign_EmailAudit, EmailAudit>()
                .ForMember(s => s.Attachments, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_EmailAudit>(s.Id));

            CreateMap<campaign_SmsAuditDetail, SmsAuditDetail>()
                .ForMember(s => s.Status, opt => opt.MapFrom(d => d.SmsAuditDetailStatusType))
                .ReverseMap()
                .ForMember(s => s.SmsAuditDetailStatusType, opt => opt.MapFrom(d => d.Status))
                .ConstructUsing(s => MapperExtensions.GetEntity<campaign_SmsAuditDetail>(s.SmsAuditDetailId));

        }
    }
}