using RMA.Common.Enums;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.MemberWizard
{
    public class MemberWizard : IWizardProcess
    {
        private readonly IMemberService _memberService;
        private readonly ILeadService _leadService;
        private readonly IWizardService _wizardService;
        private readonly IUserRegistrationService _userRegistrationService;
        private readonly IUserService _userService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;

        public MemberWizard(IMemberService memberService,
            ILeadService leadService,
            IWizardService wizardService,
            IUserRegistrationService userRegistrationService,
            IUserService userService,
            IRolePlayerService rolePlayerService,
            IDocumentIndexService documentIndexService)
        {
            _memberService = memberService;
            _leadService = leadService;
            _wizardService = wizardService;
            _userRegistrationService = userRegistrationService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _userService = userService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var quote = context.Deserialize<QuoteV2>(context.Data);

            var roleplayerId = context.LinkedItemId;
            var memberExists = await _rolePlayerService.RolePlayerExists(roleplayerId);

            if (memberExists)
            {
                _ = Task.Run(() => _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.MemberManager, "QuoteId", quote.QuoteId.ToString(), "MemberId", roleplayerId.ToString()));
                return await StartPolicyWizard(context, roleplayerId, quote);
            }
            else
            {
                var lead = await _leadService.GetLeadByRolePlayerId(roleplayerId);
                var member = await MapMemberFromLead(lead);
                member.MemberStatus = MemberStatusEnum.New;
                await _memberService.CreateMember(member);

                var label = $"New Member ({member.FinPayee.FinPayeNumber}) {member.DisplayName}";
                var stepData = new ArrayList() { quote };
                return await context.CreateWizard(label, stepData);
            }
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var quote = context.Deserialize<QuoteV2>(stepData[0].ToString());

            var roleplayerId = context.LinkedItemId;
            var member = await _memberService.GetMemberById(roleplayerId);

            if (member.MemberStatus == MemberStatusEnum.New)
            {
                member.MemberStatus = MemberStatusEnum.ActiveWithoutPolicies;
                await _memberService.UpdateMember(member);

                _ = Task.Run(() => _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.MemberManager, "QuoteId", quote.QuoteId.ToString(), "MemberId", member.RolePlayerId.ToString()));
                _ = Task.Run(() => _documentIndexService.UpdateDocumentKeys(DocumentSystemNameEnum.MemberManager, "WizardId", wizard.Id.ToString(), "MemberId", member.RolePlayerId.ToString()));

                _ = Task.Run(() => RegisterNewMember(member));
                _ = Task.Run(() => StartPolicyWizard(context, roleplayerId, quote));
            }
        }

        private async Task RegisterNewMember(RolePlayer member)
        {
            var rolePlayerContact = member.RolePlayerContacts.FirstOrDefault(s => s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact);
            var userContact = new Admin.SecurityManager.Contracts.Entities.UserContact
            {
                Email = rolePlayerContact.EmailAddress,
            };

            var existingUser = await _userService.GetUserByEmail(rolePlayerContact.EmailAddress);
            if (existingUser != null && (string.Equals(existingUser.RoleName, "member", StringComparison.OrdinalIgnoreCase) || string.Equals(existingUser.RoleName, "agent", StringComparison.OrdinalIgnoreCase)))
            {
                var userCompanyMap = new UserCompanyMap
                {
                    CompanyId = member.RolePlayerId,
                    RoleName = existingUser.RoleName,
                    UserCompanyMapStatus = UserCompanyMapStatusEnum.Active,
                    UserId = existingUser.Id
                };

                var result = await _userService.AddUserCompanyMap(userCompanyMap);
            }

            if (existingUser == null)
            {
                var pendingActivationId = await _userRegistrationService.GetPendingUserActivation(rolePlayerContact.EmailAddress);
                if (pendingActivationId > 0)
                {
                    var pendingUserCompanyMap = await _userService.GetUserCompanyMapsByUserActivationId(pendingActivationId);

                    var userCompanyMap = new UserCompanyMap
                    {
                        CompanyId = member.RolePlayerId,
                        RoleName = "Member",
                        UserCompanyMapStatus = UserCompanyMapStatusEnum.Pending,
                        UserActivationId = pendingActivationId
                    };

                    var result = await _userService.AddUserCompanyMap(userCompanyMap);
                }
                else
                {
                    var userDetails = new UserDetails
                    {
                        Name = rolePlayerContact.Firstname,
                        Surname = rolePlayerContact.Surname,
                        UserProfileType = UserProfileTypeEnum.Company,
                        UserContact = userContact,
                        IsInternalUser = false,
                        RolePlayerId = member.RolePlayerId,
                        RoleName = "Member",
                        PortalType = PortalTypeEnum.RMA
                    };

                    var result = await _userRegistrationService.RegisterUserDetails(userDetails);
                }
            }
        }

        private async Task<RolePlayer> MapMemberFromLead(Lead lead)
        {
            var member = new RolePlayer();
            member.RolePlayerId = Convert.ToInt32(lead.RolePlayerId);
            member.DisplayName = lead.DisplayName;

            var contact = lead.ContactV2.Find(s => Convert.ToInt32(s.PreferredCommunicationTypeId) == Convert.ToInt32(CommunicationTypeEnum.Email) || !string.IsNullOrEmpty(s.EmailAddress));

            member.PreferredCommunicationTypeId = contact.PreferredCommunicationTypeId;
            member.EmailAddress = contact.EmailAddress;
            member.ClientType = lead.ClientType;
            member.RolePlayerIdentificationType = (lead.ClientType == ClientTypeEnum.Individual) ? RolePlayerIdentificationTypeEnum.Person : RolePlayerIdentificationTypeEnum.Company;
            member.JoinDate = DateTime.Now;
            member.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;

            member.Company = new Company
            {
                Name = lead.Company.Name,
                CompanyIdType = (CompanyIdTypeEnum)lead.Company.RegistrationType,
                IndustryClass = lead.Company.IndustryClass,
                IndustryId = lead.Company.IndustryTypeId,
                ReferenceNumber = lead.Company.CompensationFundRegistrationNumber ?? lead.Company.RegistrationNumber,
                IdNumber = lead.Company.RegistrationNumber,
                CompensationFundReferenceNumber = lead.Company.CompensationFundReferenceNumber
            };

            var memberNumber = await _memberService.GenerateMemberNumber(member.DisplayName);
            member.FinPayee = new FinPayee
            {
                FinPayeNumber = memberNumber,
                IndustryId = Convert.ToInt32(member.Company.IndustryId)
            };

            var hasPrimaryPhysical = false;
            var hasPrimaryPostal = false;

            lead.Addresses?.ForEach(s =>
            {
                var isPrimaryPhysical = s.AddressType == AddressTypeEnum.Physical && !hasPrimaryPhysical;
                var isPrimaryPostal = s.AddressType == AddressTypeEnum.Postal && !hasPrimaryPostal;

                var rolePlayerAddress = new RolePlayerAddress
                {
                    AddressType = s.AddressType,
                    City = s.City,
                    CountryId = (int)s.CountryId,
                    PostalCode = s.PostalCode,
                    Province = s.Province,
                    AddressLine1 = s.AddressLine1,
                    AddressLine2 = s.AddressLine2,
                    EffectiveDate = s.CreatedDate,
                    IsPrimary = s.AddressType == AddressTypeEnum.Physical ? isPrimaryPhysical : isPrimaryPostal
                };

                (member.RolePlayerAddresses ?? (member.RolePlayerAddresses = new List<RolePlayerAddress>())).Add(rolePlayerAddress);

                hasPrimaryPhysical = member.RolePlayerAddresses.Any(t => t.AddressType == AddressTypeEnum.Physical && t.IsPrimary.Value);
                hasPrimaryPostal = member.RolePlayerAddresses.Any(t => t.AddressType == AddressTypeEnum.Postal && t.IsPrimary.Value);
            });

            var rolePlayerContact = new RolePlayerContact
            {
                CommunicationType = CommunicationTypeEnum.Email,
                ContactDesignationType = ContactDesignationTypeEnum.PrimaryContact,
                EmailAddress = contact.EmailAddress,
                Firstname = contact.Name,
                Surname = contact.Surname,
                RolePlayerId = member.RolePlayerId,
                Title = TitleEnum.Memb,
                ContactNumber = contact.ContactNumber,
                TelephoneNumber = contact.TelephoneNumber,
                RolePlayerContactInformations = new List<RolePlayerContactInformation>()
            };

            var contactInformation = new RolePlayerContactInformation
            {
                ContactInformationType = ContactInformationTypeEnum.Declarations,
            };

            rolePlayerContact.RolePlayerContactInformations.Add(contactInformation);

            member.RolePlayerContacts = member.RolePlayerContacts ?? new List<RolePlayerContact>();
            member.RolePlayerContacts.Add(rolePlayerContact);

            var rolePlayerRelation = new RolePlayerRelation
            {
                FromRolePlayerId = member.RolePlayerId,
                ToRolePlayerId = member.RolePlayerId,
                RolePlayerTypeId = (int)RolePlayerTypeEnum.PolicyPayee
            };

            member.FromRolePlayers = member.FromRolePlayers ?? new List<RolePlayerRelation>();
            member.FromRolePlayers.Add(rolePlayerRelation);

            return member;
        }

        private async Task<int> StartPolicyWizard(IWizardContext context, int rolePlayerId, QuoteV2 quote)
        {
            var type = quote.UnderwriterId == Convert.ToInt32(UnderwriterEnum.RMAMutualAssurance) ? "rma-policy" : "rml-policy";
            var startWizardRequest = new StartWizardRequest
            {
                LinkedItemId = rolePlayerId,
                Type = type,
                Data = context.Serialize(quote),
                AllowMultipleWizards = true
            };

            var wizard = await _wizardService.StartWizard(startWizardRequest);
            return wizard.Id;
        }

        public async Task CancelWizard(IWizardContext context)
        {
            int roleplayerId = 0;
            if (context != null)
            {
                roleplayerId = context.LinkedItemId;
            }
            var member = await _memberService.GetMemberById(roleplayerId);

            if (member.MemberStatus == MemberStatusEnum.New)
            {
                member.MemberStatus = MemberStatusEnum.Inactive;
                await _memberService.UpdateMember(member);
            }
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            int roleplayerId = 0;
            if (context != null)
            {
                roleplayerId = context.LinkedItemId;
            }
            var member = await _memberService.GetMemberById(roleplayerId);

            if (member.MemberStatus == MemberStatusEnum.New)
            {
                member.MemberStatus = MemberStatusEnum.Inactive;
                await _memberService.UpdateMember(member);
            }
        }

        #region Not Implemented
        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var ruleResults = new List<RuleResult>();
            return GetRuleRequestResult(true, ruleResults);
        }

        private RuleRequestResult GetRuleRequestResult(bool success, List<RuleResult> results)
        {
            return new RuleRequestResult
            {
                RequestId = Guid.NewGuid(),
                RuleResults = results,
                OverallSuccess = success
            };
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return await Task.FromResult<string>(string.Empty);
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            return;
        }

        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }

        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        #endregion
    }

}
