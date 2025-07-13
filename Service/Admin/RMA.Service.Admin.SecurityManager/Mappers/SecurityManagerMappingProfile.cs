using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Database.Entities;

namespace RMA.Service.Admin.SecurityManager.Mappers
{
    public class SecurityManagerMappingProfile : Profile
    {
        /// <summary>
        ///     Create the mappers that map the database types to the contract types
        /// </summary>
        public SecurityManagerMappingProfile()
        {

            CreateMap<security_User, User>()
                    .ForMember(x => x.Preferences, y => y.Ignore())
                    .ForMember(x => x.AuthenticationTypeId, y => y.MapFrom(user => (int)user.AuthenticationType))
                    .ForMember(x => x.PortalType, y => y.MapFrom(user => (int)user.PortalType))
                    .ForMember(x => x.Name, y => y.Ignore())
                    .ForMember(x => x.DateViewed, y => y.Ignore())
                    .ForMember(x => x.PlainTextPassword, y => y.Ignore())
                    .ForMember(x => x.IsApproved, y => y.Ignore())
                    .ForMember(x => x.ClientId, y => y.Ignore())
                    .ForMember(x => x.IpAddress, y => y.Ignore())
                    .ForMember(x => x.PermissionIds, y => y.Ignore())
                    .ForMember(x => x.RoleName, y => y.Ignore())
                    .ForMember(x => x.PortalTypeId, y => y.MapFrom(user => (int)user.PortalType))
                    .ReverseMap()
                    .ForMember(u => u.UserPreferences, y => y.Ignore())
                    .ForMember(u => u.Tenants, y => y.Ignore())
                    .ConstructUsing(s => MapperExtensions.GetEntity<security_User>(s.Id));

            CreateMap<security_Application, LastViewedItem>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.ItemId, opt => opt.Ignore())
                .ForMember(s => s.ItemType, opt => opt.Ignore())
                .ForMember(s => s.User, opt => opt.Ignore())
                .ForMember(s => s.Date, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_Application>(s.Id));

            CreateMap<security_Note, NoteModel>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_Note>(s.Id));

            CreateMap<security_Note, Note>()
                .ForMember(s => s.Reason, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_Note>(s.Id));

            CreateMap<security_PasswordResetAuthorisation, PasswordResetAuthorization>()
                .ForMember(s => s.Email, opt => opt.MapFrom(d => d.EmailAddress))
                .ReverseMap()
                .ForMember(s => s.EmailAddress, opt => opt.MapFrom(d => d.Email));

            CreateMap<security_Permission, Permission>()
                .ForMember(s => s.OverridesRolePermission, opt => opt.Ignore()).ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_Permission>(s.Id));

            CreateMap<security_Role, Role>()
                .ForMember(s => s.Permission, opt => opt.Ignore())
                .ForMember(s => s.DateViewed, opt => opt.Ignore())
                .ForMember(s => s.PermissionIds, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_Role>(s.Id))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<security_Tenant, Tenant>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_Tenant>(s.Id));

            CreateMap<security_UserPreference, UserPreference>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserPreference>(s.Id));

            CreateMap<security_TenantPreference, TenantPreference>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_TenantPreference>(s.Id));

            CreateMap<security_WorkPoolUser, WorkPoolUser>()
                .ForMember(a => a.TenantId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_WorkPoolUser>(s.Id));

            CreateMap<security_PermissionGroup, PermissionGroup>()
              .ForMember(s => s.Permissions, opt => opt.MapFrom(d => d.Permissions))
              .ReverseMap()
              .PreserveReferences()
              .ConstructUsing(s => MapperExtensions.GetEntity<security_PermissionGroup>(s.Id));

            CreateMap<security_UserDetail, UserDetails>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IdTypeEnum, opt => opt.Ignore())
                .ForMember(s => s.CompanyRegistrationNumber, opt => opt.Ignore())
                .ForMember(s => s.HealthCareProviderId, opt => opt.Ignore())
                .ForMember(s => s.BrokerFspNumber, opt => opt.Ignore())
                .ForMember(s => s.UserActivation, opt => opt.Ignore())
                .ForMember(s => s.Password, opt => opt.Ignore())
                .ForMember(s => s.UserExistInActivationTable, opt => opt.Ignore())
                .ForMember(s => s.UserAddress, opt => opt.Ignore())
                .ForMember(s => s.UserContact, opt => opt.Ignore())
                .ForMember(s => s.IsVopdPassed, opt => opt.Ignore())
                .ForMember(s => s.UserActivationLinkIsActive, opt => opt.Ignore())
                .ForMember(s => s.UserActivationMessage, opt => opt.Ignore())
                .ForMember(s => s.UserId, opt => opt.Ignore())
                .ForMember(s => s.BrokerageId, opt => opt.Ignore())
                .ForMember(s => s.IsInternalUser, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerId, opt => opt.Ignore())
                .ForMember(s => s.RoleId, opt => opt.Ignore())
                .ForMember(s => s.PortalType, opt => opt.Ignore())
                .ForMember(s => s.RoleName, opt => opt.Ignore())
                .ForMember(s => s.UserProfileTypeId, y => y.MapFrom(user => (int)user.UserProfileType))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserDetail>(s.UserDetailsId));

            CreateMap<security_UserAddress, UserAddress>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserAddress>(s.UserAddressId));

            CreateMap<security_UserContact, UserContact>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserContact>(s.UserContactId));

            CreateMap<security_UserActivation, UserActivation>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserActivation>(s.UserActivationId));

            CreateMap<security_UserBrokerageMap, UserBrokerageMap>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserBrokerageMap>(s.UserId));

            CreateMap<security_UserHealthCareProviderMap, UserHealthCareProvider>()
                .ForMember(s => s.Name, opt => opt.Ignore())
                .ForMember(s => s.PracticeNumber, opt => opt.Ignore())
                .ForMember(s => s.CompCareMSPId, opt => opt.Ignore())
                .ForMember(s => s.TenantId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserHealthCareProviderMap>(s.UserHealthCareProviderMapId));

            CreateMap<UserPermission, security_UserPermission2>()
                .ForMember(s => s.Permission, opt => opt.Ignore())
                .ForMember(s => s.User, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<security_RoleAmountLimit, RoleAmountLimit>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<security_RoleAmountLimit>(s.RoleAmountLimitId));

            CreateMap<security_UserCompanyMap, UserCompanyMap>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.RoleName, opt => opt.Ignore())
                .ForMember(s => s.UserName, opt => opt.Ignore())
                .ForMember(s => s.DisplayName, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.Role, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<security_UserCompanyMap>(s.UserCompanyMapId));
        }
    }
}