using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class OnboardingNotificationFacade : RemotingStatelessService, IOnboardingNotificationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly IPolicyCommunicationService _communicationService;
        private readonly IPolicyService _policyService;

        private readonly IRepository<Load_PremiumListingMember> _premiumListingRepository;
        private readonly IRepository<Load_ConsolidatedFuneralMember> _consolidatedFuneralRepository;
        private readonly IRepository<Load_MyValuePlusMember> _myValuePlusRepository;

        public OnboardingNotificationFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            IPolicyCommunicationService communicationService,
            IPolicyService policyService,
            IRepository<Load_PremiumListingMember> premiumListingRepository,
            IRepository<Load_ConsolidatedFuneralMember> consolidatedFuneralRepository,
            IRepository<Load_MyValuePlusMember> myValuePlusRepository

        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _communicationService = communicationService;
            _policyService = policyService;
            _premiumListingRepository = premiumListingRepository;
            _consolidatedFuneralRepository = consolidatedFuneralRepository;
            _myValuePlusRepository = myValuePlusRepository;
        }

        public async Task SendPremiumListingNewPolicyNotification(string wizardName, Guid fileIdentifier)
        {
            if (!string.IsNullOrWhiteSpace(wizardName))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        var list = new List<string>();
                        // Get the new policy notification email address
                        var recipient = await _configurationService.GetModuleSetting(SystemSettings.NewPolicyNotificationRecipient);
                        if (string.IsNullOrEmpty(recipient))
                        {
                            throw new Exception("New policy notification recipient setting not saved");
                        }
                        // Read the list of imported main members
                        var members = await _premiumListingRepository
                            .Where(s => s.FileIdentifier == fileIdentifier
                                     && s.CoverMemberType == CoverMemberTypeEnum.MainMember)
                            .ToListAsync();
                        if (members?.Count == 0)
                        {
                            throw new Exception($"No members found for premium listing onboarding task {fileIdentifier}");
                        }
                        foreach (var member in members)
                        {
                            var policy = await _policyService.GetPolicyWithoutReferenceData(member.PolicyId);
                            list.Add(GetPolicyMemberTableRow(wizardName, Mapper.Map<PolicyModel>(policy), member.MemberName, member.IdNumber, member.DateOfBirth.Value));
                        }
                        // Send the notification
                        await SendNewPolicyNotification(recipient, "Scheme Onboarding Notification", GetMemberTable(list));
                    }
                    catch (Exception ex)
                    {
                        // Do not throw, not a critical error
                        ex.LogException("New Premium Listing Notification Error");
                    }
                }
            }
        }

        public async Task<bool> SendConsolidatedFuneralNewPolicyNotifications(string wizardName, Guid fileIdentifier)
        {
            if (!string.IsNullOrWhiteSpace(wizardName))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        var list = new List<string>();
                        // Get the new policy notification email address
                        var recipient = await _configurationService.GetModuleSetting(SystemSettings.NewPolicyNotificationRecipient);
                        if (string.IsNullOrEmpty(recipient))
                        {
                            throw new Exception("New policy notification recipient setting not saved");
                        }
                        // Read the list of imported main members
                        var members = await _consolidatedFuneralRepository
                            .Where(s => s.FileIdentifier == fileIdentifier
                                     && s.CoverMemberType == CoverMemberTypeEnum.MainMember)
                            .ToListAsync();
                        if (members?.Count == 0)
                        {
                            throw new Exception($"No members found for consolidated funeral onboarding task {fileIdentifier}");
                        }
                        foreach (var member in members)
                        {
                            var policy = await _policyService.GetPolicyWithoutReferenceData(member.PolicyId);
                            list.Add(GetPolicyMemberTableRow(wizardName, Mapper.Map<PolicyModel>(policy), member.MemberName, member.IdNumber, member.DateOfBirth.Value));
                        }
                        // Send the notification
                        await SendNewPolicyNotification(recipient, "Consolidated Funeral Onboarding Notification", GetMemberTable(list));
                        return true;
                    }
                    catch (Exception ex)
                    {
                        // Do not throw, not a critical error
                        ex.LogException("New Consolidated Funeral Notification Error");
                        return false;
                    }
                }
            }
            return false;
        }

        public async Task SendQlinkErrorNotification(string policyNumber, string errorMessage)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                try
                {
                    var list = new List<string>();
                    // Get the new policy notification email address
                    var recipient = await _configurationService.GetModuleSetting(SystemSettings.NewPolicyNotificationRecipient);
                    if (string.IsNullOrEmpty(recipient))
                    {
                        throw new Exception("New policy notification recipient setting not saved");
                    }
                    const string subject = "Onboarding Qlink Error";
                    var content = "<p>"
                            + $"Policy Number: {policyNumber}"
                            + "<br/>"
                            + $"Error Message: {errorMessage}"
                            + "</p>";
                    await _communicationService.SendEmail(recipient, subject, content);
                }
                catch (Exception ex)
                {
                    // Do not throw, not a critical error
                    ex.LogException("Consolidated Funeral Qlink Notification Error");
                }
            }
        }

        public async Task SendMyValuePlusNewPolicyNotifications(string wizardName, Guid fileIdentifier)
        {
            if (!string.IsNullOrWhiteSpace(wizardName))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        var list = new List<string>();
                        // Get the new policy notification email address
                        var recipient = await _configurationService.GetModuleSetting(SystemSettings.NewPolicyNotificationRecipient);
                        if (string.IsNullOrEmpty(recipient))
                        {
                            throw new Exception("New policy notification recipient setting not saved");
                        }
                        // Read the list of imported main members
                        var members = await _myValuePlusRepository
                            .Where(s => s.FileIdentifier == fileIdentifier
                                     && s.CoverMemberType == CoverMemberTypeEnum.MainMember)
                            .ToListAsync();
                        if (members?.Count == 0)
                        {
                            throw new Exception($"No members found for my value plus onboarding task {fileIdentifier}");
                        }
                        foreach (var member in members)
                        {
                            var policy = await _policyService.GetPolicyWithoutReferenceData(member.PolicyId);
                            list.Add(GetPolicyMemberTableRow(wizardName, Mapper.Map<PolicyModel>(policy), member.MemberName, member.IdNumber, member.DateOfBirth.Value));
                        }
                        // Send the notification
                        await SendNewPolicyNotification(recipient, "My Value Plus Onboarding Notification", GetMemberTable(list));
                    }
                    catch (Exception ex)
                    {
                        // Do not throw, not a critical error
                        ex.LogException("New My Value Plus Notification Error");
                    }
                }
            }
        }

        private async Task SendNewPolicyNotification(string recipient, string subject, string members)
        {
            // Build the message body
            var content = await _configurationService.GetModuleSetting(SystemSettings.NewPolicyNotificationMessageBody);
            if (string.IsNullOrEmpty(content))
            {
                throw new Exception("New policy notification template has not been configured");
            }
            // Add the members to the message body
            content = content.Replace("{0}", members);
            // Send the email
            await _communicationService.SendEmail(recipient, subject, content);
        }

        private string GetMemberTable(List<string> members)
        {
            var table = "<table><head>"
                + "<th>Wizard Name</th>"
                + "<th>Policy Number</th>"
                + "<th>Import Status</th>"
                + "<th>Inception Date</th>"
                + "<th>Premium</th>"
                + "<th>Main Member</th>"
                + "<th>ID Number</th>"
                + "<th>Date of Birth</th>"
                + "</head><body>";
            foreach (var member in members)
            {
                table += member;
            }
            table += "</body></table>";
            return table;
        }

        private string GetPolicyMemberTableRow(string wizardName, PolicyModel policy, string memberName, string idNumber, DateTime dateOfBirth)
        {
            Contract.Requires(policy != null);
            var policyStatus = policy.CreatedDate.Date == policy.ModifiedDate.Date ? "New Policy" : "Updated Policy";
            var row = "<tr>"
                + $"<td>{wizardName}</td>"
                + $"<td>{policy.PolicyNumber}</td>"
                + $"<td>{policyStatus}</td>"
                + $"<td>{policy.PolicyInceptionDate:yyyy-MM-dd}</td>"
                + $"<td>{policy.InstallmentPremium:#,##0.00}</td>"
                + $"<td>{memberName.ToUpper()}</td>"
                + $"<td>{idNumber}</td>"
                + $"<td>{dateOfBirth:yyyy-MM-dd}</td>"
                + "</tr>";
            return row;
        }
    }
}
