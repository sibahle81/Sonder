using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class Wizard : AuditDetails
    {
        public int TenantId { get; set; }
        public bool CanApprove { get; set; }
        public bool CanEdit { get; set; }
        public bool CanStart { get; set; }
        public string CantApproveReason { get; set; }
        public string CurrentStep { get; set; }
        public int CurrentStepIndex { get; set; }
        public string CustomRoutingRole { get; set; }
        public int? CustomRoutingRoleId { get; set; }
        public string CustomStatus { get; set; }
        public string Data { get; set; }
        public bool HasApproval { get; set; }
        public int LinkedItemId { get; set; }
        public string LockedReason { get; set; }
        public string LockedToUser { get; set; }
        public string LockedToUserDisplayName { get; set; }
        public string ModifiedByDisplayName { get; set; }
        public string CreatedByDisplayName { get; set; }
        public string Name { get; set; }
        public string StartType { get; set; }
        public string Type { get; set; }
        public WizardConfiguration WizardConfiguration { get; set; }
        public List<WizardPermissionOverride> WizardPermissionOverrides { get; set; }
        public int WizardConfigurationId { get; set; }
        public WizardStatusEnum WizardStatus { get; set; }
        public int WizardStatusId
        {
            get => (int)WizardStatus;
            set => WizardStatus = (WizardStatusEnum)value;
        }
        public string WizardStatusText { get; set; }
        public System.DateTime? StartDateAndTime { get; set; }
        public System.DateTime? EndDateAndTime { get; set; }
        public TimeSpan? OverAllTimeElapsed { get; set; }
        public SlaRAGIndicatorEnum SlaRAGIndicator
        {
            get
            {
                var overAllSlaIndicator = SlaRAGIndicatorEnum.None;
                if (WizardConfiguration != null)
                {
                    var tOverAllSla = new TimeSpan(0, WizardConfiguration.SlaWarning.GetValueOrDefault(), 0, 0);
                    var tOverAllSlaAmber = new TimeSpan(0, WizardConfiguration.SlaEscalation.GetValueOrDefault(), 0, 0);

                    var endDateAndTime = DateTimeHelper.SaNow;
                    if (EndDateAndTime.HasValue)
                    {
                        endDateAndTime = EndDateAndTime.Value;
                    }
                    OverAllTimeElapsed = endDateAndTime - StartDateAndTime;

                    if (OverAllTimeElapsed.HasValue && WizardConfiguration.SlaWarning.HasValue && WizardConfiguration.SlaEscalation.HasValue)
                    {
                        overAllSlaIndicator = SlaRAGIndicatorEnum.Green;

                        var nOverAllSla = TimeSpan.Compare(OverAllTimeElapsed.GetValueOrDefault(), tOverAllSla);
                        if (nOverAllSla == 1)
                        {
                            overAllSlaIndicator = SlaRAGIndicatorEnum.Red;

                            var nOverAllSlaAmber = TimeSpan.Compare(OverAllTimeElapsed.GetValueOrDefault(), tOverAllSlaAmber);
                            if (nOverAllSlaAmber == -1 || nOverAllSlaAmber == 0)
                                overAllSlaIndicator = SlaRAGIndicatorEnum.Amber;
                        }
                    }
                }
                return overAllSlaIndicator;
            }
        }

        public int SlaRAGIndicatorId
        {
            get => (int)SlaRAGIndicator;
        }

        public string OverAllSLAHours
        {
            get
            {
                string OverAllSLA_Hours = string.Empty;
                if (OverAllTimeElapsed != null)
                {
                    OverAllSLA_Hours = string.Format("{0:D2} days,{1:D2} hrs,{2:D2} mins", OverAllTimeElapsed.GetValueOrDefault().Days,
                            OverAllTimeElapsed.GetValueOrDefault().Hours, OverAllTimeElapsed.GetValueOrDefault().Minutes);
                    return OverAllSLA_Hours;
                }
                return OverAllSLA_Hours;
            }
        }

    }
}