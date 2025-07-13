using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyCommunicationService : IService
    {
        Task SendFuneralPolicyDocuments(int wizardId, Case caseModel, Case parentCaseModel, PolicySendDocsProcessTypeEnum policySendDocsProcessType);
        Task SendOnePremiumMissedCommunication(PolicyCommunication policyCommunication);
        Task SendSecondPremiumMissedCommunication(PolicyCommunication policyCommunication);
        Task SendGroupPolicyOrganisationDocuments(PolicyModel policy, int policyId, string policyNumber, string memberName, string emailAddress);
        Task SendGroupSchemePolicyDocuments(PolicyModel policy, int policyId, string policyNumber, string memberName, string emailAddress, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsandConditions);
        Task SendGroupPolicyMemberPolicyDocuments(int policyId, string policyNumber, string memberName, string idNumber, string emailAddress, bool isEuropAssist, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions);
        Task SendIndividualPolicyMemberPolicyDocuments(int policyId, string policyNumber, string memberName, string idNumber, string emailAddress, bool isEuropAssist, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions);

        Task SendPremiumListingGroupPolicyMemberPolicyDocuments(PolicyModel policy, int policyId, string policyNumber, string memberName, string idNumber, string emailAddress, bool isEuropAssist, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions);
        Task SendGroupPolicyMemberDocuments(int policyId, string policyNumber, string memberName, string emailAddress, bool isEuropAssist);
        Task SendGroupPolicySchedulesToBroker(int parentPolicyId, string parentPolicyNumber, string schemeName, List<PolicyMember> policies, string brokerName, string recipient);
        Task<bool> SendOneTimePin(ItemTypeEnum itemType, int itemId, string cellNumber, int oneTimePin);
        Task SendPolicyCancellationCommunication(Case caseModel);
        Task SendLapseCommunication(PolicyCommunication policyCommunication);
        Task SendGroupOnboardingDocuments(PolicyModel policy, PolicyEmail policyEmail, PolicyMember parentPolicyMember, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsandConditions);
        Task SendGroupPolicyMemberSchedules(PolicyEmail policyEmail, List<PolicyMember> policyMembers, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions);
        Task SendPremiumListingGroupPolicyMemberSchedules(PolicyModel policy, PolicyEmail policyEmail, List<PolicyMember> policyMembers, bool sendWelcomeLetter, bool sendPolicySchedule, bool sendTermsAndConditions);
        Task SendModifiedCOIDPolicySchedule(PolicyModel policy, int wizardId);
        Task SendRMAAssurancePolicySchedule(PolicyModel policy, int wizardId);
        Task SendMaintainRMAAssurancePolicySchedule(PolicyModel policy);
        Task SendCancelPolicySchedule(PolicyModel policy);
        Task SendReinstatePolicySchedule(PolicyModel policy, int wizardId);
        Task SendPolicyReinstatedMessages(Case @case, DateTime reinstateDate);
        Task SendInsuredLifeUploadMessages(int successMessageCount, int failedMessageCount, List<string> messages);
        Task SendPolicySchemeChangedSmsNotification(string schemeName, string cellNumber, int policyId, string policyNumber, DateTime effectiveDate);
        Task SendContactChangeMessages(Case policyCase, bool amendEmail, bool amendContact, bool amendPostal, bool amendBanking, bool isGroup);
        Task SendPolicyCancellationAfterThreeLapses(Case policyCase, bool isGroup, string groupEmail);
        Task SendPolicyCancellationDocuments(int policyId, string policyNumber, string memberName, string memberEmail, string representativeEmail, PolicySendDocsProcessTypeEnum policySendType, ProductClassEnum productClassEnum);
        Task SendPolicyCancellationSms(string cellNumber, int policyId, string policyNumber);
        Task SendBulkDeclarationSms(List<Contracts.Entities.RolePlayer.RolePlayer> rolePlayers);
        Task SendChildOverAgeSMS(int policyId, string policyNumber, string cellNumber, string childName, int daysNotification);
        Task SendChildOverAgeEmail(int policyId, int childRolePlayerId, int daysNotification, string policyNumber, string emailAddress, string displayName, string childName);
        Task<int> SendConsolidatedFuneralPolicyDocuments(List<ConsolidatedFuneralSummary> consolidatedFuneralSummary);
        Task<List<SendCommunicationResult>> SendMyValuePlusPolicyDocuments(List<MyValuePlusSummary> myValuePlusSummary);

        Task SendConsolidatedFuneralPolicySchedules(List<ConsolidatedFuneralSummary> consolidatedFuneralSummaries);
        Task SendMyValuePlusPolicySchedules(List<MyValuePlusSummary> myValuePlusSummaries);

        Task SendEmail(string recipient, string subject, string body);
        Task SendEmailWithCopies(string recipient, string cc, string bcc, string subject, string body);
        Task SendPolicyScheduleBySms(PolicyMember policy);

        Task SendPolicyScheduleUpdateNotificationBySms(PolicyMember policyMember);
        Task SendPremiumListingPolicyScheduleBySms(PolicyModel policy, PolicyMember policyMember);
        Task<bool> SendAnnualIncreaseEmail(PolicyMember member, AnnualIncrease increase);
        Task<bool> SendAnnualIncreaseSms(PolicyMember member, AnnualIncrease increase);
        Task SendAnnualIncreasePolicyScheduleSms(PolicyMember member);
        Task SendAnnualIncreasePolicyScheduleEmail(PolicyMember member);
        Task SendPolicyHolderBirthdayWishesBySMS(PolicyholderBirthdaySMSModel policyholderBirthdaySMSModel);
        Task<bool> SendPaybackNotificationSms(PolicyMember member, PremiumPayback payback);
        Task<bool> SendPaybackConfirmationSms(PolicyMember member, PremiumPayback payback);

        Task SendPolicyDocumentsBySms(PolicyMember policy, TemplateTypeEnum templateType);
        Task SendPolicyAmendedNotificationBySms(PolicyMember policyMember, TemplateTypeEnum templateType);

        Task SendPolicyDocumentsByRole(int parentPolicyId, string parentPolicyNumber, string schemeName, List<PolicyMember> policies, string brokerName, string recipient);


    }
}

