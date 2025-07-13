using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IClaimCommunicationService : IService
    {
        Task<int> SendDiseaseClaimEmail(ClaimEmail claimEmail);
        Task<int> SendDiseaseClaimSMS(ClaimSMS claimSMS);
        Task SendFollowUpsForDocumentsRequired();
        Task<int> SendClosingLetterForNotificationsOnly(ClaimEmail claimEmail);
        Task<ClaimEmail> GenerateClaimClosingLetter(AutoAjudicateClaim autoAjudicateClaim, TemplateTypeEnum templateType);
        Task<int> SendAcknowledgementLetter(ClaimEmail claimEmail);
        Task SendNotificationClosedCommunication(ClaimEmail claimEmail, ClaimSMS claimSMS, RolePlayer rolePlayer, RolePlayerContact employerContact, PersonEvent personEvent);
        Task ProccessCommunicationNotification(ClaimCommunicationMessage message);
        Task PublishCommunicationNotification(ClaimCommunicationMessage message);
        Task SendAdditionalDocumentRequestSms(AdditionalDocumentRequest additionalDocumentRequest);
        Task<int> SendAdditionalDocumentRequestEmail(AdditionalDocumentRequest additionalDocumentRequest, PersonEvent personEvent);
        Task SendNotification(ClaimEmail claimEmail, ClaimSMS claimSMS, RolePlayer employee, string claimNumber, RolePlayerContact employerContact, ClaimCommunicationTypeEnum claimCommunicationTypeEnum);
        Task<int> SendNotificationSMS(ClaimSMS claimSMS, string message);
        Task<int> SendAccidentClaimEmailAndSMS(PersonEvent personEvent, ClaimEmail claimEmail, ClaimSMS claimSMS, bool isNotificationOnly);
        Task<ClaimCommunicationMessage> SetupContactDetailsForEmployeeAndEmployer(int personEventId);
        Task<ClaimCommunicationMessage> GetContactDetailsForEmployeeAndEmployer(int personEventId, ClaimCommunicationTypeEnum claimCommunicationTypeEnum);
        Task<int> SendDeletedClaimEmail(int personEventId);
        Task<string> GetSelectedRequiredDocuments(List<ClaimAdditionalRequiredDocument> additionalDocs);
        Task<bool> SendClaimNotification(PersonEvent personEvent, TemplateTypeEnum templateTypeEnum);
        Task SendFollowUpCommunication(PersonEvent personEvent, RolePlayer company, RolePlayer employee, List<string> documentsNotReceieved, TemplateTypeEnum templateType, bool noteAdded, int dayCount, string note);
        Task<string> SendCommunication(PersonEvent personEvent, ClientCare.Contracts.Entities.Policy.Policy policy, Brokerage brokerage);
        Task SendMMIExpiryEmail(string hcpEmailAddress, string fromEmailAddress, int personEventId, string employeeName, string hcpName, DateTime incidentDate, DateTime lastReportDate, string companyNumber, string claimNumber);
        Task SendAdhocClaimRequirementCommunicationEmail(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest);
        Task SendAdhocClaimRequirementCommunicationSms(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest);
    }
}