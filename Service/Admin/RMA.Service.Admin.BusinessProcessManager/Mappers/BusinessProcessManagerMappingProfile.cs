using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Threading;


namespace RMA.Service.Admin.BusinessProcessManager.Mappers
{
    public class BusinessProcessManagerMappingProfile : Profile
    {
        public BusinessProcessManagerMappingProfile()
        {
            CreateMap<bpm_Approval, Approval>()
                .ForMember(s => s.TablePK, opt => opt.Ignore())
                .ForMember(s => s.TableName, opt => opt.Ignore())
                .ForMember(s => s.ApprovalTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<bpm_Approval>(s.Id));

            CreateMap<bpm_LastViewed, LastViewedItem>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<bpm_LastViewed>(s.Id));

            CreateMap<bpm_Note, Note>()
                .ForMember(s => s.Reason, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<bpm_Note>(s.Id));


            CreateMap<bpm_Wizard, Wizard>()
                .ForMember(s => s.Type, opt => opt.MapFrom(a => a.WizardConfiguration == null ? null : a.WizardConfiguration.Name))
                .ForMember(s => s.CurrentStep, opt => opt.MapFrom(a => a.CurrentStepIndex.ToString()))
                .ForMember(s => s.LockedReason, opt => opt.Ignore())
                .ForMember(s => s.LockedToUserDisplayName, opt => opt.Ignore())
                .ForMember(s => s.ModifiedByDisplayName, opt => opt.Ignore())
                .ForMember(s => s.CreatedByDisplayName, opt => opt.Ignore())
                .ForMember(s => s.HasApproval, opt => opt.Ignore())
                .ForMember(s => s.CanApprove, opt => opt.Ignore())
                .ForMember(s => s.CantApproveReason, opt => opt.Ignore())
                .ForMember(s => s.CanEdit, opt => opt.Ignore())
                .ForMember(s => s.CanStart, opt => opt.Ignore())
                .ForMember(s => s.StartType, opt => opt.MapFrom(f => f.CurrentStepIndex))
                .ForMember(s => s.CustomRoutingRole, opt => opt.Ignore())
                .ForMember(s => s.WizardStatusText, opt => opt.Ignore())
                .ForMember(s => s.WizardStatusId, opt => opt.Ignore())
                .ForMember(s => s.OverAllTimeElapsed, opt => opt.Ignore())
                .ForMember(s => s.OverAllSLAHours, opt => opt.Ignore())
                .ForMember(s => s.SlaRAGIndicator, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.CurrentStepIndex, opt => opt.MapFrom(src => int.Parse(src.CurrentStepIndex.ToString())))
                .ConstructUsing(s => MapperExtensions.GetEntity<bpm_Wizard>(s.Id));

            CreateMap<bpm_WizardConfiguration, WizardConfiguration>()
                .ForMember(s => s.ApprovalPermissions, opt => opt.Ignore())
                .ForMember(s => s.StartPermissions, opt => opt.Ignore())
                .ForMember(s => s.ContinuePermissions, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<bpm_WizardConfiguration>(s.Id));

            CreateMap<bpm_WizardConfigurationRouteSetting, WizardConfigurationRouteSetting>()
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<bpm_WizardConfigurationRouteSetting>(s.Id));

            CreateMap<bpm_WizardApprovalStage, WizardApprovalStage>()
                .ForMember(s => s.StatusName, opt => opt.MapFrom(d => GetApprovalStatusName(d.StatusId)))
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<bpm_WizardApprovalStage>(s.WizardApprovalStageId));

            CreateMap<bpm_WizardPermissionOverride, WizardPermissionOverride>()
               .ReverseMap()
               .ForMember(s => s.Wizard, opt => opt.Ignore())
               .ConstructUsing(s => MapperExtensions.GetEntity<bpm_WizardPermissionOverride>(s.WizardPermissionOverrideId));

            CreateMap<bpm_WizardPermission, WizardPermission>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<bpm_WizardPermission>(s.Id));
        }

        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);

        private string GetApprovalStatusName(int statusId)
        {
            var statusName = string.Empty;
            _locker.Wait();
            try
            {
                var approvalStatusEnum = (WizardApprovalStageStatusEnum)statusId;
                statusName = approvalStatusEnum.GetDescription();
            }
            finally
            {
                _locker.Release();
            }
            return statusName;
        }
    }
}