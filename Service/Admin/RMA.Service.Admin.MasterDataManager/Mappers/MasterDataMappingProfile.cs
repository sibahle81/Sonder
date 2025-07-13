using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

namespace RMA.Service.Admin.MasterDataManager.Mappers
{
    public class MasterDataManagerMappingProfile : Profile
    {
        public MasterDataManagerMappingProfile()
        {

            CreateMap<common_CityRetrieval, CityRetrieval>()
                .ForMember(s => s.Code, opt => opt.Ignore())
                .ForMember(s => s.LastChangedBy, opt => opt.Ignore())
                .ForMember(s => s.LastChangedDate, opt => opt.Ignore())
                .ForMember(s => s.Province, opt => opt.Ignore())
                .ForMember(s => s.City, opt => opt.Ignore())
                .ForMember(s => s.Suburb, opt => opt.Ignore());

            CreateMap<common_PreviousInsurer, PreviousInsurer>().ReverseMap();

            CreateMap<common_PostalCode, PostalCode>();
            CreateMap<common_BankBranch, BankBranch>();
            CreateMap<common_Bank, Bank>();
            CreateMap<common_Branch, RMABranch>();
            CreateMap<common_Country, Country>()
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore()); ;


            CreateMap<common_DocumentTemplate, DocumentTemplate>()
                .ForMember(s => s.DocumentTypeId, opt => opt.Ignore());
            CreateMap<common_StateProvince, StateProvince>();
            CreateMap<common_Menu, Menu>();
            CreateMap<common_PrimeRate, PrimeRate>();
            CreateMap<common_Underwriter, Underwriter>();
            CreateMap<common_BankAccount, BankAccount>()
                .ForMember(s => s.BranchName, opt => opt.Ignore())
                .ForMember(s => s.BankAccountTypeId, opt => opt.Ignore())
                .ForMember(s => s.BranchCode, opt => opt.Ignore())
                .ForMember(s => s.ClientTypeId, opt => opt.Ignore());
            CreateMap<common_City, City>()
                .ForMember(s => s.ProvinceId, opt => opt.MapFrom(t => t.StateProvinceId));
            CreateMap<common_Industry, Industry>()
                .ForMember(s => s.Description, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore()); //TODO WHY?

            CreateMap<common_Module, Module>();
            CreateMap<common_NatureOfBusiness, NatureOfBusiness>()
                .ForMember(s => s.Description, opt => opt.MapFrom(t => t.Description))
                .ForMember(s => s.Category, opt => opt.MapFrom(t => t.Category))
                .ForMember(s => s.CreatedBy, opt => opt.MapFrom(t => t.CreatedBy))
                .ForMember(s => s.CreatedDate, opt => opt.MapFrom(t => t.CreatedDate))
                .ForMember(s => s.ExpireDate, opt => opt.MapFrom(t => t.ExpireDate))
                .ForMember(s => s.Id, opt => opt.MapFrom(t => t.Id))
                .ForMember(s => s.IsActive, opt => opt.MapFrom(t => t.IsActive))
                .ForMember(s => s.IsDeleted, opt => opt.MapFrom(t => t.IsDeleted))
                .ForMember(s => s.ModifiedDate, opt => opt.MapFrom(t => t.ModifiedDate))
                .ForMember(s => s.SicCode, opt => opt.MapFrom(t => t.SicCode))
                .ForMember(s => s.Name, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.MapFrom(t => t.ModifiedBy)); // OR SOC Code?

            CreateMap<common_OwnerUpload, OwnerUpload>()
                .ForMember(s => s.DocumentType, d => d.MapFrom(r => r.Upload.MimeType))
                .ForMember(s => s.Token, d => d.MapFrom(r => r.Upload.Token))
                .ForMember(s => s.Name, d => d.MapFrom(r => r.Upload.Name))
                .ReverseMap()
                .ForMember(s => s.Upload, d => d.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<common_OwnerUpload>(s.Id));
            CreateMap<common_SkillCategory, SkillCategory>()
                .ForMember(s => s.Description, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.SkillSubCategoryId, opt => opt.Ignore());  //TODO WHY?;

            CreateMap<common_Upload, Uploads>()
                .ForMember(s => s.Url, opt => opt.Ignore()) //NEW
                .ForMember(s => s.HasUploaded, opt => opt.Ignore()) //NEW
                .ForMember(s => s.ImportId, opt => opt.Ignore()) //NEW
                .ForMember(s => s.Message, opt => opt.Ignore()) //NEW
                .ForMember(s => s.DocumentType, opt => opt.Ignore()) //NEW
                .ReverseMap()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.OwnerUploads, opt => opt.Ignore());

            CreateMap<common_FollowUp, FollowUp>()
             .ForMember(s => s.AlertTime, d => d.Ignore())
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_FollowUp>(s.Id));

            CreateMap<common_RequiredDocument, RequiredDocument>()
                .ForMember(s => s.DocumentCategoryName, opt => opt.Ignore())
                .ForMember(s => s.DocumentCategoryId, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<common_PublicHoliday, PublicHoliday>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_PublicHoliday>(s.Id));

            CreateMap<common_Setting, ModuleSetting>()
                .ForMember(s => s.Keys, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_Setting>(s.Id));

            CreateMap<common_DocumentGeneratorAudit, DocumentGeneratorAudit>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_DocumentGeneratorAudit>(s.Id));

            CreateMap<common_ValidityCheckSet, ValidityCheckSet>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_ValidityCheckSet>(s.Id));

            CreateMap<common_ValidityCheckCategory, ValidityCheckCategory>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_ValidityCheckCategory>(s.Id));

            CreateMap<common_Period, Period>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<common_Period>(s.Id));

            CreateMap<common_FeatureFlagSetting, ModuleSetting>()
                    .ForMember(s => s.Keys, opt => opt.Ignore())
                    .ReverseMap()
                    .ConstructUsing(s => MapperExtensions.GetEntity<common_FeatureFlagSetting>(s.Id));

            CreateMap<common_Announcement, Announcement>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore()).ReverseMap();

            CreateMap<common_AnnouncementRole, AnnouncementRole>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore()).ReverseMap();

            CreateMap<common_DesignationType, Lookup>()
                .ForMember(s => s.Id, d => d.MapFrom(r => r.DesignationTypeId))
                .ForMember(s => s.Name, d => d.MapFrom(r => r.Name))
                .ForMember(s => s.Description, d => d.MapFrom(r => r.Description))
                .ReverseMap();

            CreateMap<common_AnnouncementUserAcceptance, AnnouncementUserAcceptance>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore()).ReverseMap();

            CreateMap<common_CommissionBand, CommissionBand>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<common_CommissionBand>(s.CommissionBandId));

            CreateMap<common_Vat, Vat>()
                .ForMember(s => s.Id, opt => opt.Ignore()).ReverseMap();

            CreateMap<common_EuropAssistPremiumMatrix, EuropAssistPremiumMatrix>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<common_EuropAssistPremiumMatrix>(s.Id));

            CreateMap<common_PayeeType, PayeeType>()
                .ForMember(s => s.Id, opt => opt.Ignore()).ReverseMap();

            CreateMap<common_UnderAssessReason, UnderAssessReason>()
                .ForMember(s => s.InvoiceId, opt => opt.Ignore())
                .ForMember(s => s.TebaInvoiceId, opt => opt.Ignore())
                .ForMember(s => s.UnderAssessReasonText, opt => opt.Ignore())
                .ForMember(s => s.Comments, opt => opt.Ignore())
                .ForMember(s => s.Id, opt => opt.Ignore()).ReverseMap();

            CreateMap<common_ServiceBusMessage, MessageType>()
                .ForMember(s => s.MessageTypeTaskHandler, opt => opt.Ignore())
                .ForMember(s => s.ImpersonateUser, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<common_SlaItemTypeConfiguration, SlaItemTypeConfiguration>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_SlaItemTypeConfiguration>(s.SlaItemTypeConfigurationId));

            CreateMap<common_SlaStatusChangeAudit, SlaStatusChangeAudit>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_SlaStatusChangeAudit>(s.SlaStatusChangeAuditId));

            CreateMap<common_SlaMovementAudit, SLAMovementAudit>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_SlaMovementAudit>(s.SlaMovementAuditId));

            CreateMap<common_UserReminder, UserReminder>()
           .ReverseMap()
           .ConstructUsing(s => MapperExtensions.GetEntity<common_UserReminder>(s.UserReminderId));

            CreateMap<common_PoolWorkFlow, PoolWorkFlow>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_PoolWorkFlow>(s.PoolWorkFlowId));

            CreateMap<common_MonthlyScheduledWorkPoolUser, MonthlyScheduledWorkPoolUser>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_MonthlyScheduledWorkPoolUser>(s.MonthlyScheduledWorkPoolUserId));

            CreateMap<common_ReportViewedAudit, ReportViewedAudit>()
           .ReverseMap()
           .ConstructUsing(s => MapperExtensions.GetEntity<common_ReportViewedAudit>(s.ReportViewedAuditId));

            CreateMap<common_Note, CommonSystemNote>()
            .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<common_Note>(s.Id));

            CreateMap<common_NoteModule, CommonSystemNoteModule>()
            .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<common_NoteModule>(s.Id));

            CreateMap<common_ReferralStatusChangeAudit, ReferralStatusChangeAudit>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_ReferralStatusChangeAudit>(s.ReferralStatusChangeAuditId));

            CreateMap<common_ReferralPerformanceRating, ReferralPerformanceRating>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_ReferralPerformanceRating>(s.ReferralPerformanceRatingId));

            CreateMap<common_ReferralNatureOfQuery, ReferralNatureOfQuery>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_ReferralNatureOfQuery>(s.ReferralNatureOfQueryId));

            CreateMap<common_ReferralFeedback, ReferralFeedback>()
             .ReverseMap()
             .ConstructUsing(s => MapperExtensions.GetEntity<common_ReferralFeedback>(s.ReferralFeedbackId));

            CreateMap<common_Referral, Referral>()
             .ReverseMap()
             .ForMember(s => s.ReferralNatureOfQuery, opt => opt.Ignore())
             .ConstructUsing(s => MapperExtensions.GetEntity<common_Referral>(s.ReferralId));

            CreateMap<common_LookupValue, LookupValue>()
             .ForMember(dest => dest.LookupTypeId, opt => opt.Ignore());

            CreateMap<common_AuthorityLimitConfiguration, AuthorityLimitConfiguration>()
             .ReverseMap()
             .ForMember(s => s.AuthorityLimitConfigurationUserAudits, opt => opt.Ignore())
             .ConstructUsing(s => MapperExtensions.GetEntity<common_AuthorityLimitConfiguration>(s.AuthorityLimitConfigurationId));
            CreateMap<common_SftpRequest, SftpRequest>().ReverseMap().ConstructUsing(s => MapperExtensions.GetEntity<common_SftpRequest>(s.SftpRequestId));

            CreateMap<common_AuthorityLimitConfigurationUserAudit, AuthorityLimitConfigurationUserAudit>()
            .ReverseMap()
            .ForMember(s => s.AuthorityLimitConfiguration, opt => opt.Ignore())
            .ConstructUsing(s => MapperExtensions.GetEntity<common_AuthorityLimitConfigurationUserAudit>(s.AuthorityLimitConfigurationUserAuditId));
            CreateMap<common_SftpRequestItem, SftpRequestItem>()
            .ReverseMap().ConstructUsing(s => MapperExtensions.GetEntity<common_SftpRequestItem>(s.SftpRequestItemId)); 

            CreateMap<common_SftpRequestTypeConnection, SftpRequestTypeConnection>()
                .ReverseMap().ConstructUsing(s => MapperExtensions.GetEntity<common_SftpRequestTypeConnection>(s.SftpRequestTypeConnectionId)); 

            CreateMap<common_SftpResponse, SftpResponse>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_SftpResponse>(s.SftpResponseId));

            CreateMap<common_RolePlayerItemQuery, RolePlayerItemQuery>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_RolePlayerItemQuery>(s.Id));

            CreateMap<common_RolePlayerItemQueryItem, RolePlayerItemQueryItem>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_RolePlayerItemQueryItem>(s.Id));

            CreateMap<common_RolePlayerItemQueryItemTypeCategory, RolePlayerItemQueryItemTypeCategory>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_RolePlayerItemQueryItemTypeCategory>(s.Id));

            CreateMap<common_RolePlayerItemQueryItemTypeRole, RolePlayerItemQueryItemTypeRole>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_RolePlayerItemQueryItemTypeRole>(s.Id));

            CreateMap<common_RolePlayerItemQueryItemTypeWizard, RolePlayerItemQueryItemTypeWizard>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_RolePlayerItemQueryItemTypeWizard>(s.Id));

            CreateMap<common_RolePlayerItemQueryResponse, RolePlayerItemQueryResponse>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<common_RolePlayerItemQueryResponse>(s.RolePlayerItemQueryId));
        }
    }
}
