using Newtonsoft.Json;

using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.RuleTasks.Enums;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class MedicalWorkflowManagement
    {
        private readonly IMediCareService _mediCareService;
        private readonly IWizardService _wizardService;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IWizardConfigurationRouteSettingService _wizardConfigurationRouteSettingService;

        public MedicalWorkflowManagement(IMediCareService mediCareService
            , IWizardService wizardService
            , IRoleService roleService
            , IUserService userService
            , IWizardConfigurationRouteSettingService wizardConfigurationRouteSettingService)
        {
            _mediCareService = mediCareService;
            _wizardService = wizardService;
            _roleService = roleService;
            _userService = userService;
            _wizardConfigurationRouteSettingService = wizardConfigurationRouteSettingService;
        }


        public async Task SendNotificationForCaptureMedicalInvoice(Invoice invoice)
        {
            if (invoice != null)
            {
                await SendWorkflowNotificationToMedicalUser(invoice, "New Medical Invoice captured");
            }
            if (invoice != null)
            {
                var healthcareProviderUser = await _userService.GetUserLinkedToHealthCareProviderId(invoice.HealthCareProviderId);
                if (healthcareProviderUser != null)
                {
                    await SendNotification("capture-medical-invoice-notification", "A new Medical Invoice has been captured", "Please click the Action Link to View Details", $"medicare/view-medical-invoice/{invoice.InvoiceId}", invoice.InvoiceId, healthcareProviderUser.Email);
                }
            }
        }

        public async Task SendNotificationForPendMedicalInvoice(InvoiceDetails invoiceDetails, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, List<InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasons, bool sendToClaimUser = false)
        {
            Contract.Requires(invoiceDetails != null);
            var invoice = new Invoice()
            {
                InvoiceId = invoiceDetails.InvoiceId,
                InvoiceStatus = invoiceDetails.InvoiceStatus,
                AuthorisedAmount = invoiceDetails.AuthorisedAmount,
                AuthorisedTotalInclusive = invoiceDetails.AuthorisedTotalInclusive,
                AuthorisedVat = invoiceDetails.AuthorisedVat,
                ClaimId = invoiceDetails.ClaimId,
                DateAdmitted = invoiceDetails.DateAdmitted,
                DateDischarged = invoiceDetails.DateDischarged,
                DateReceived = invoiceDetails.DateReceived,
                CreatedDate = invoiceDetails.CreatedDate,
                Comments = invoiceDetails.Comments,
                HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                HcpInvoiceNumber = invoiceDetails.HcpInvoiceNumber,
                HcpAccountNumber = invoiceDetails.HcpAccountNumber,
                InvoiceAmount = invoiceDetails.InvoiceAmount,
                InvoiceDate = invoiceDetails.InvoiceDate,
                InvoiceNumber = invoiceDetails.InvoiceNumber,
                InvoiceTotalInclusive = invoiceDetails.InvoiceTotalInclusive,
                InvoiceVat = invoiceDetails.InvoiceVat,
                PersonEventId = invoiceDetails.PersonEventId
            };
            if (sendToClaimUser)
            {
                await SendWorkflowNotificationToClaimUser(invoice, "Medical Invoice pended");
            }
            else
            {
                await SendWorkflowNotificationToMedicalUser(invoice, "Medical Invoice pended");
            }
            var wizardConfigurationRouteSetting = await _wizardConfigurationRouteSettingService.GetWizardConfigurationRouteSettingByWorkflowType("pend-medical-invoice-notification");
            string invoiceNumber = invoiceDetails?.InvoiceNumber;
            string batchNumber = invoiceDetails.HcpInvoiceNumber;
            string hcpName = invoiceDetails.HealthCareProviderName;
            string invoicePendedMessage = wizardConfigurationRouteSetting.MessageTemplate.Replace("{invoiceNumber}", invoiceNumber).Replace("{hcpName}", hcpName).Replace("{batchNumber}", batchNumber);
            string invoicePendMessage = "";
            for (int i = 0; i < invoiceUnderAssessReasons?.Count; i++)
            {
                if (invoicePendMessage.Length == 0)
                {
                    invoicePendMessage += invoiceUnderAssessReasons?[i].UnderAssessReason;
                }
                else
                {
                    invoicePendMessage += ", " + invoiceUnderAssessReasons?[i].UnderAssessReason;
                }
            }
            for (int i = 0; i < invoiceLineUnderAssessReasons?.Count; i++)
            {
                if (invoicePendMessage.Length == 0)
                {
                    invoicePendMessage += invoiceLineUnderAssessReasons?[i].UnderAssessReason;
                }
                else
                {
                    invoicePendMessage += ", " + invoiceLineUnderAssessReasons?[i].UnderAssessReason;
                }
            }
            invoicePendedMessage = invoicePendedMessage.Replace("{invoicePendMessage}", invoicePendMessage);

            var healthcareProviderUser = await _userService.GetUserLinkedToHealthCareProviderId(invoiceDetails.HealthCareProviderId);
            if (healthcareProviderUser != null && wizardConfigurationRouteSetting != null)
            {
                await SendNotification(wizardConfigurationRouteSetting.WorkflowType, wizardConfigurationRouteSetting.NotificationTitle, invoicePendedMessage, wizardConfigurationRouteSetting.ActionLink + invoiceDetails.InvoiceId, invoiceDetails.InvoiceId, healthcareProviderUser.Email);
            }
        }

        public async Task SendNotificationForRejectMedicalInvoice(InvoiceDetails invoiceDetails, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, List<InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasons, bool sendToClaimUser = false)
        {
            Contract.Requires(invoiceDetails != null);
            var invoice = new Invoice()
            {
                InvoiceId = invoiceDetails.InvoiceId,
                InvoiceStatus = invoiceDetails.InvoiceStatus,
                AuthorisedAmount = invoiceDetails.AuthorisedAmount,
                AuthorisedTotalInclusive = invoiceDetails.AuthorisedTotalInclusive,
                AuthorisedVat = invoiceDetails.AuthorisedVat,
                ClaimId = invoiceDetails.ClaimId,
                DateAdmitted = invoiceDetails.DateAdmitted,
                DateDischarged = invoiceDetails.DateDischarged,
                DateReceived = invoiceDetails.DateReceived,
                CreatedDate = invoiceDetails.CreatedDate,
                Comments = invoiceDetails.Comments,
                HealthCareProviderId = invoiceDetails.HealthCareProviderId,
                HcpInvoiceNumber = invoiceDetails.HcpInvoiceNumber,
                HcpAccountNumber = invoiceDetails.HcpAccountNumber,
                InvoiceAmount = invoiceDetails.InvoiceAmount,
                InvoiceDate = invoiceDetails.InvoiceDate,
                InvoiceNumber = invoiceDetails.InvoiceNumber,
                InvoiceTotalInclusive = invoiceDetails.InvoiceTotalInclusive,
                InvoiceVat = invoiceDetails.InvoiceVat,
                PersonEventId = invoiceDetails.PersonEventId
            };
            if (sendToClaimUser)
            {
                await SendWorkflowNotificationToClaimUser(invoice, "Medical Invoice rejected");
            }
            else
            {
                await SendWorkflowNotificationToMedicalUser(invoice, "Medical Invoice rejected");
            }
            var wizardConfigurationRouteSetting = await _wizardConfigurationRouteSettingService.GetWizardConfigurationRouteSettingByWorkflowType("reject-medical-invoice-notification");
            string invoiceNumber = invoiceDetails?.InvoiceNumber;
            string batchNumber = invoiceDetails.HcpInvoiceNumber;
            string hcpName = invoiceDetails.HealthCareProviderName;
            string invoiceRejectedMessage = wizardConfigurationRouteSetting.MessageTemplate.Replace("{invoiceNumber}", invoiceNumber).Replace("{hcpName}", hcpName).Replace("{batchNumber}", batchNumber);
            string invoiceRejectMessage = "";

            for (int i = 0; i < invoiceUnderAssessReasons?.Count; i++)
            {
                if (invoiceRejectMessage.Length == 0)
                {
                    invoiceRejectMessage += invoiceUnderAssessReasons?[i].UnderAssessReason;
                }
                else
                {
                    invoiceRejectMessage += ", " + invoiceUnderAssessReasons?[i].UnderAssessReason;
                }
            }
            for (int i = 0; i < invoiceLineUnderAssessReasons?.Count; i++)
            {
                if (invoiceRejectMessage.Length == 0)
                {
                    invoiceRejectMessage += invoiceLineUnderAssessReasons?[i].UnderAssessReason;
                }
                else
                {
                    invoiceRejectMessage += ", " + invoiceLineUnderAssessReasons?[i].UnderAssessReason;
                }
            }
            invoiceRejectedMessage = invoiceRejectedMessage.Replace("{invoiceRejectMessage}", invoiceRejectMessage);
            var healthcareProviderUser = await _userService.GetUserLinkedToHealthCareProviderId(invoiceDetails.HealthCareProviderId);
            if (healthcareProviderUser != null)
            {
                await SendNotification(wizardConfigurationRouteSetting.WorkflowType, wizardConfigurationRouteSetting.NotificationTitle, invoiceRejectedMessage, wizardConfigurationRouteSetting.ActionLink + invoiceDetails.InvoiceId, invoiceDetails.InvoiceId, healthcareProviderUser.Email);
            }
        }

        public async Task SendNotificationForICD10CodeMismatchMedicalInvoice(InvoiceDetails invoiceDetails)
        {
            //check if notification already sent - might need to refector the checking in the future
            var wizard = await _wizardService.GetWizardByLinkedItemId((int)invoiceDetails?.InvoiceId);

            if (wizard == null)
            {
                string invoiceNumber = invoiceDetails?.InvoiceNumber;
                string batchNumber = invoiceDetails.HcpInvoiceNumber;
                string hcpName = invoiceDetails.HealthCareProviderName;
                string invoiceICD10CodeMismatchMessage = $"Invoice {invoiceNumber}, for {hcpName} and {batchNumber} has ICD10Code Mismatch as follows: ";

                invoiceDetails?.InvoiceLineDetails.ForEach(line =>
                {
                    var icd10CodeMismatchReason = line?.InvoiceLineUnderAssessReasons.Where(z => z.UnderAssessReasonId == (int)UnderAssessReasonEnum.icd10CodeMismatchToClaimICD10).FirstOrDefault();

                    if (icd10CodeMismatchReason != null && icd10CodeMismatchReason.UnderAssessReasonId > 0)
                    {
                        invoiceICD10CodeMismatchMessage += ", " + line?.Icd10Code + "-" + icd10CodeMismatchReason.UnderAssessReason;
                    }

                });

                var healthcareProviderUser = await _userService.GetUserLinkedToHealthCareProviderId(invoiceDetails.HealthCareProviderId);
                if (healthcareProviderUser != null)
                {
                    await SendNotification("pend-medical-invoice-notification", "Your Medical invoice has been pended", $"{invoiceICD10CodeMismatchMessage}. Please click the Action Link to View Details", $"medicare/view-medical-invoice/{invoiceDetails.InvoiceId}", invoiceDetails.InvoiceId, healthcareProviderUser.Email);
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

        private async Task SendWorkflowNotificationToMedicalUser(Invoice invoice, string workflowDescription)
        {
            var currentUserEmail = RmaIdentity.Email;
            var medicalUserRole = await _roleService.GetRoleByName(MedicalRoles.MedicalInvoiceApprovalController);
            if (medicalUserRole != null)
            {
                var startWizardRequest = new StartWizardRequest
                {
                    Type = "edit-medical-invoice",
                    LinkedItemId = invoice.InvoiceId,
                    Data = JsonConvert.SerializeObject(invoice),
                    RequestInitiatedByBackgroundProcess = true,
                    CustomRoutingRoleId = medicalUserRole.Id
                };
                var wizard = await _wizardService.StartWizard(startWizardRequest);
                if (wizard != null)
                {
                    await _mediCareService.CreateWorkflow(new Workflow
                    {
                        AssignedToRoleId = medicalUserRole.Id,
                        AssignedToUserId = null,
                        CreatedBy = currentUserEmail,
                        CreatedDate = DateTime.Now,
                        Description = workflowDescription,
                        IsActive = true,
                        IsDeleted = false,
                        ModifiedBy = currentUserEmail,
                        ModifiedDate = DateTime.Now,
                        ReferenceId = invoice.InvoiceId,
                        ReferenceType = "Invoice",
                        StartDateTime = DateTime.Now,
                        EndDateTime = null,
                        WizardId = wizard.Id,
                        WorkPool = WorkPoolEnum.Medicalpool
                    });
                }
            }
        }

        private async Task SendWorkflowNotificationToClaimUser(Invoice invoice, string workflowDescription)
        {
            var currentUserEmail = RmaIdentity.Email;
            var clinicalClaimsAdjudicatorRole = await _roleService.GetRoleByName(MedicalRoles.ClinicalClaimsAdjudicator);
            if (clinicalClaimsAdjudicatorRole != null)
            {
                var startWizardRequest = new StartWizardRequest
                {
                    Type = "edit-medical-invoice",
                    LinkedItemId = invoice.InvoiceId,
                    Data = JsonConvert.SerializeObject(invoice),
                    RequestInitiatedByBackgroundProcess = true,
                    CustomRoutingRoleId = clinicalClaimsAdjudicatorRole.Id
                };
                var wizard = await _wizardService.StartWizard(startWizardRequest);
                if (wizard != null)
                {
                    await _mediCareService.CreateWorkflow(new Workflow
                    {
                        AssignedToRoleId = clinicalClaimsAdjudicatorRole.Id,
                        AssignedToUserId = null,
                        CreatedBy = currentUserEmail,
                        CreatedDate = DateTime.Now,
                        Description = workflowDescription,
                        IsActive = true,
                        IsDeleted = false,
                        ModifiedBy = currentUserEmail,
                        ModifiedDate = DateTime.Now,
                        ReferenceId = invoice.InvoiceId,
                        ReferenceType = "Invoice",
                        StartDateTime = DateTime.Now,
                        EndDateTime = null,
                        WizardId = wizard.Id,
                        WorkPool = WorkPoolEnum.Medicalpool
                    });
                }
            }
        }
    }
}
