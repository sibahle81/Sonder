using Newtonsoft.Json.Linq;

using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.RuleTasks;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.PensCare.Contracts.Entities.PensionCase;
using RMA.Service.PensCare.Contracts.Interfaces.ClaimMap;

using System;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.BusinessProcessTasks.Notifications
{
    public class NotificationManagement
    {
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IPreAuthorisationService _preAuthorisationService;
        private readonly IPensionClaimMapService _pensionClaimMapService;
        PreAuthRulesHelper preAuthRulesHelper;

        public NotificationManagement(IWizardService wizardService, IUserService userService, IRoleService roleService,
            IPreAuthorisationService preAuthorisationService, IPreAuthClaimService preAuthClaimService,
            IPensionClaimMapService pensionClaimMapService)
        {
            _wizardService = wizardService;
            _userService = userService;
            _roleService = roleService;
            _preAuthorisationService = preAuthorisationService;
            _pensionClaimMapService = pensionClaimMapService;
            preAuthRulesHelper = new PreAuthRulesHelper(preAuthClaimService);
        }

        public async Task SendNotificationsForCapturePreAuth(IWizardContext context, PreAuthorisation preAuthorisation)
        {
            if (preAuthRulesHelper != null)
            {
                var currentUserEmail = RmaIdentity.Email;
                var hcpUser = await _userService.GetUserLinkedToHealthCareProviderId(preAuthorisation.HealthCareProviderId);
                User treatingDoctorUser = null;
                var treatingDoctorAuth = preAuthorisation.SubPreAuthorisations?.Find(x => x.PreAuthType == PreAuthTypeEnum.TreatingDoctor);
                if (treatingDoctorAuth != null)
                {
                    treatingDoctorUser =
                        await _userService.GetUserLinkedToHealthCareProviderId(treatingDoctorAuth.HealthCareProviderId);
                }

                if (hcpUser != null && currentUserEmail == hcpUser?.Email && treatingDoctorUser != null)
                {
                    await SendNotification("capture-preauth-notification", "A new Preauthoristion has been captured", "Please click the Action Link to View Details", $"medicare/preauth-view/{preAuthorisation.PreAuthId}", preAuthorisation.PreAuthId, treatingDoctorUser.Email);
                }
                else if (treatingDoctorUser != null && currentUserEmail == treatingDoctorUser?.Email && hcpUser != null)
                {
                    await SendNotification("capture-preauth-notification", "A new Preauthoristion has been captured", "Please click the Action Link to View Details", $"medicare/preauth-view/{preAuthorisation.PreAuthId}", preAuthorisation.PreAuthId, hcpUser.Email);
                }
                else
                {
                    if (hcpUser != null)
                        await SendNotification("capture-preauth-notification", $"A new Preauthoristion has been captured", "Please click the Action Link to View Details", $"medicare/preauth-view/{preAuthorisation.PreAuthId}", preAuthorisation.PreAuthId, hcpUser.Email);
                    if (treatingDoctorUser != null)
                        await SendNotification("capture-preauth-notification", $"A new Preauthoristion has been captured", "Please click the Action Link to View Details", $"medicare/preauth-view/{preAuthorisation.PreAuthId}", preAuthorisation.PreAuthId, treatingDoctorUser.Email);
                }
            }
        }

        public async Task SendNotificationsForEditPreAuth(IWizardContext context, PreAuthorisation preAuthorisation, string createdByUser)
        {
            var currentUserEmail = RmaIdentity.Email;
            var ruleData = await preAuthRulesHelper.GetClaimEventDateAndPreAuthFromDateAsRuleData(preAuthorisation?.PersonEventId, preAuthorisation.DateAuthorisedFrom);
            var eventDate = Convert.ToDateTime(JToken.Parse(ruleData).Value<string>("EventDate"));
            var medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);

            var type = "review-preauth";
            if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.Treatment)
                type = "review-treatment-preauth";
            else if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.ChronicMedication)
                type = "review-chronic-preauth";
            else if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.Prosthetic)
                type = "review-prosthetic-preauth";

            PensionClaimMap pensionClaimMap = new PensionClaimMap();
            if (preAuthorisation.ClaimId != null)
            {
                pensionClaimMap = await _pensionClaimMapService.GetClaimMapByClaimId((int)preAuthorisation.ClaimId);
            }

            if (pensionClaimMap?.PensionCaseId > 0)
            {
                medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.PensionerMedicalCaseAuditor);
            }
            else
            {
                if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Hospitalization)
                {
                    medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                }
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Treatment)
                {
                    bool isInHospital = (bool)preAuthorisation.IsInHospital;
                    if (!isInHospital)
                    {
                        if (DateTime.Today <= eventDate.AddYears(2))
                        {
                            medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
                        }
                        else if (preAuthorisation.ClaimId != null)
                        {
                            var claimStatus = await preAuthRulesHelper.GetClaimStatus((int)preAuthorisation.ClaimId);
                            if (claimStatus == ClaimStatusEnum.Closed || claimStatus == ClaimStatusEnum.Finalized)
                            {
                                medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                            }
                            else if (claimStatus == ClaimStatusEnum.Open)
                            {
                                medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
                            }
                        }
                    }
                }
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Prosthetic)
                {
                    medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                }
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.ChronicMedication)
                {
                    if (DateTime.Today <= eventDate.AddYears(2))
                    {
                        medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
                    }
                    else
                    {
                        medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                    }
                }
            }

            if (medicalUserRole != null)
            {
                var startWizard = new StartWizardRequest
                {
                    Type = type,
                    LinkedItemId = preAuthorisation.PreAuthId,
                    Data = context?.Serialize(preAuthorisation),
                    RequestInitiatedByBackgroundProcess = true,
                    CustomRoutingRoleId = medicalUserRole.Id
                };

                var wizard = await CreateTaskWorkflow(startWizard);
                if (wizard != null)
                {
                    await _preAuthorisationService.CreateWorkflow(new Workflow
                    {
                        AssignedToRoleId = medicalUserRole.Id,
                        AssignedToUserId = null,
                        CreatedBy = currentUserEmail,
                        CreatedDate = DateTime.Now,
                        Description = Enum.GetName(typeof(PreAuthTypeEnum), preAuthorisation.PreAuthType) + " Pre-Authorisation edited",
                        IsActive = true,
                        IsDeleted = false,
                        ModifiedBy = currentUserEmail,
                        ModifiedDate = DateTime.Now,
                        ReferenceId = preAuthorisation.PreAuthId,
                        ReferenceType = "PreAuthorisation",
                        StartDateTime = DateTime.Now,
                        EndDateTime = null,
                        WizardId = wizard.Id,
                        WorkPool = WorkPoolEnum.Medicalpool,
                        WizardURL = "/medicare/work-manager/" + type + "/continue/" + wizard.Id.ToString(),
                        LockedToUserId = 0
                    });
                }
            }

            var startWizardRequest = new StartWizardRequest
            {
                Type = "edit-preauth",
                LinkedItemId = preAuthorisation.PreAuthId,
                Data = context?.Serialize(preAuthorisation),
                RequestInitiatedByBackgroundProcess = true
            };

            var hcpUser = await _userService.GetUserLinkedToHealthCareProviderId(preAuthorisation.HealthCareProviderId);
            if (hcpUser != null)
            {
                if (preAuthorisation.PreAuthStatus == PreAuthStatusEnum.InfoRequired)
                {
                    startWizardRequest.LockedToUser = hcpUser.Email;
                    await CreateTaskWorkflow(startWizardRequest);
                }
                else
                {
                    await SendNotification("review-preauth-notification", "Review Notification to Health Care Provider for PreAuthorisation", "Notification : PreAuthorisation reviewed message. Reviewed by " + createdByUser, $"medicare/preauth-view/{preAuthorisation.PreAuthId}", preAuthorisation.PreAuthId, hcpUser.Email);
                }
            }

            var treatingDoctorAuth = preAuthorisation.SubPreAuthorisations?.Find(x => x.PreAuthType == PreAuthTypeEnum.TreatingDoctor);
            if (treatingDoctorAuth != null)
            {
                var treatingDoctorUser = await _userService.GetUserLinkedToHealthCareProviderId(treatingDoctorAuth.HealthCareProviderId);
                if (treatingDoctorUser != null)
                {
                    if (treatingDoctorAuth.PreAuthStatus == PreAuthStatusEnum.InfoRequired)
                    {
                        startWizardRequest.LockedToUser = treatingDoctorUser.Email;
                        await CreateTaskWorkflow(startWizardRequest);
                    }
                    else
                    {
                        await SendNotification("review-preauth-notification", "Review Notification to Health Care Provider for PreAuthorisation", "Notification : PreAuthorisation reviewed message. Reviewed by " + createdByUser, $"medicare/preauth-view/{preAuthorisation.PreAuthId}", preAuthorisation.PreAuthId, treatingDoctorUser.Email);
                    }
                }
            }
        }

        public async Task SendNotificationsForReviewPreAuth(IWizardContext context, PreAuthorisation preAuthorisation)
        {
            var type = "review-preauth";
            if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.Treatment)
                type = "review-treatment-preauth";
            else if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.ChronicMedication)
                type = "review-chronic-preauth";
            else if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.Prosthetic)
                type = "review-prosthetic-preauth";

            if (preAuthorisation != null)
            {
                var lastActivity = await _preAuthorisationService.GetPreAuthActivity(preAuthorisation.PreAuthId, PreAuthStatusEnum.InfoRequired);
                if (lastActivity != null && context != null)
                {
                    var startWizardRequest = new StartWizardRequest
                    {
                        Type = type,
                        LinkedItemId = preAuthorisation.PreAuthId,
                        Data = context.Serialize(preAuthorisation),
                        RequestInitiatedByBackgroundProcess = true
                    };
                    await CreateTaskWorkflow(startWizardRequest);
                }
            }
        }

        private async Task SendNotification(string wizardConfigurationName,
        string notificationTitle,
        string notificationMessage,
        string notificationActionLink,
        int linkedItemId,
        string lockedToUser)
        {
            await _wizardService.SendWizardNotification(wizardConfigurationName, notificationTitle, notificationMessage, notificationActionLink, linkedItemId, lockedToUser);
        }

        private async Task<Wizard> CreateTaskWorkflow(StartWizardRequest startWizardRequest)
        {
            return await _wizardService.StartWizard(startWizardRequest);
        }

        private async Task<bool> CreateWorkflowPreAuthCapture(IWizardContext context, PreAuthorisation preAuthorisation)
        {
            var currentUserEmail = RmaIdentity.Email;
            var ruleData = await preAuthRulesHelper.GetClaimEventDateAndPreAuthFromDateAsRuleData(preAuthorisation?.PersonEventId, preAuthorisation.DateAuthorisedFrom);
            var eventDate = Convert.ToDateTime(JToken.Parse(ruleData).Value<string>("EventDate"));
            
            var medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);

            var type = "review-preauth";
            if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.Treatment)
                type = "review-treatment-preauth";
            else if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.ChronicMedication)
                type = "review-chronic-preauth";
            else if (preAuthorisation?.PreAuthType == PreAuthTypeEnum.Prosthetic)
                type = "review-prosthetic-preauth";

            PensionClaimMap pensionClaimMap = new PensionClaimMap();
            if (preAuthorisation.ClaimId != null)
            {
                pensionClaimMap = await _pensionClaimMapService.GetClaimMapByClaimId((int)preAuthorisation.ClaimId);
            }

            if (pensionClaimMap?.PensionCaseId > 0)
            {
                medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.PensionerMedicalCaseAuditor);
            }
            else
            {
                if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Hospitalization)
                {
                    medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                }
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Treatment)
                {
                    bool isInHospital = (bool)preAuthorisation.IsInHospital;
                    if (!isInHospital)
                    {
                        if (DateTime.Today <= eventDate.AddYears(2))
                        {
                            medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
                        }
                        else if (preAuthorisation.ClaimId != null)
                        {
                            var claimStatus = await preAuthRulesHelper.GetClaimStatus((int)preAuthorisation.ClaimId);
                            if (claimStatus == ClaimStatusEnum.Closed || claimStatus == ClaimStatusEnum.Finalized)
                            {
                                medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                            }
                            else if (claimStatus == ClaimStatusEnum.Open)
                            {
                                medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
                            }
                        }
                    }
                }
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.Prosthetic)
                {
                    medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                }
                else if (preAuthorisation.PreAuthType == PreAuthTypeEnum.ChronicMedication)
                {
                    if (DateTime.Today <= eventDate.AddYears(2))
                    {
                        medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
                    }
                    else
                    {
                        medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalAdminAssistant);
                    }
                }
            }

            if (medicalUserRole != null)
            {
                var startWizard = new StartWizardRequest
                {
                    Type = type,
                    LinkedItemId = preAuthorisation.PreAuthId,
                    Data = context.Serialize(preAuthorisation),
                    RequestInitiatedByBackgroundProcess = true,
                    CustomRoutingRoleId = medicalUserRole.Id
                };

                var wizard = await CreateTaskWorkflow(startWizard);
                if (wizard != null)
                {
                    await _preAuthorisationService.CreateWorkflow(new Workflow
                    {
                        AssignedToRoleId = medicalUserRole.Id,
                        AssignedToUserId = null,
                        CreatedBy = currentUserEmail,
                        CreatedDate = DateTime.Now,
                        Description = Enum.GetName(typeof(PreAuthTypeEnum), preAuthorisation.PreAuthType) + " Pre-Authorisation edited",
                        IsActive = true,
                        IsDeleted = false,
                        ModifiedBy = currentUserEmail,
                        ModifiedDate = DateTime.Now,
                        ReferenceId = preAuthorisation.PreAuthId,
                        ReferenceType = "PreAuthorisation",
                        StartDateTime = DateTime.Now,
                        EndDateTime = null,
                        WizardId = wizard.Id,
                        WorkPool = WorkPoolEnum.Medicalpool,
                        WizardURL = "/medicare/work-manager/" + type + "/continue/" + wizard.Id.ToString(),
                        LockedToUserId = 0
                    });
                }
            }

            var startWizardRequest = new StartWizardRequest
            {
                Type = "edit-preauth",
                LinkedItemId = preAuthorisation.PreAuthId,
                Data = context.Serialize(preAuthorisation),
                RequestInitiatedByBackgroundProcess = true
            };

            return await Task.FromResult(true);
        }
    }
}
