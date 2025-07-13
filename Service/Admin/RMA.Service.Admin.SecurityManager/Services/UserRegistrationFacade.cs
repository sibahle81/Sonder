using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using UserAddress = RMA.Service.Admin.BusinessProcessManager.Contracts.Entities.UserAddress;
using UserContact = RMA.Service.Admin.SecurityManager.Contracts.Entities.UserContact;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class UserRegistrationFacade : RemotingStatelessService, IUserRegistrationService
    {
        private const string DefaultHashAlgorithm = "SHA512";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_UserDetail> _userDetailsRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IConfigurationService _configurationService;
        private readonly ISendEmailService _sendEmailService;
        private readonly IDocumentTemplateService _documentTemplateService;
        private readonly IRepository<security_UserActivation> _userActivationRepository;
        private readonly IRepository<security_UserContact> _userContactRepository;
        private readonly IRepository<security_UserAddress> _userAddressRepository;
        private readonly IRepository<security_UserBrokerageMap> _userBrokerageRepository;
        private readonly IRepository<security_Permission> _permissionRepository;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly ISerializerService _serializerService;
        private readonly IBrokerageService _brokerageService;
        private readonly IRepository<security_UserHealthCareProviderMap> _userHealthCareProviderMapRepository;
        private readonly IMapper _mapper;


        public UserRegistrationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRolePlayerService rolePlayerService,
            IConfigurationService configurationService,
            ISendEmailService sendEmailService,
            IDocumentTemplateService documentTemplateService,
            IRepository<security_UserActivation> userActivationRepository,
            IRepository<security_UserDetail> userDetailsRepository,
            IRepository<security_UserContact> userContactRepository,
            IRepository<security_UserAddress> userAddressRepository,
            IRepository<security_UserBrokerageMap> userBrokerageRepository,
            IUserService userService,
            IRoleService roleService,
            ISerializerService serializerService,
            IBrokerageService brokerageService,
            IRepository<security_UserHealthCareProviderMap> userHealthCareProviderMapRepository,
            IRepository<security_Permission> permissionRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _userDetailsRepository = userDetailsRepository;
            _rolePlayerService = rolePlayerService;
            _configurationService = configurationService;
            _sendEmailService = sendEmailService;
            _userActivationRepository = userActivationRepository;
            _documentTemplateService = documentTemplateService;
            _userContactRepository = userContactRepository;
            _userAddressRepository = userAddressRepository;
            _userService = userService;
            _roleService = roleService;
            _serializerService = serializerService;
            _userBrokerageRepository = userBrokerageRepository;
            _brokerageService = brokerageService;
            _userHealthCareProviderMapRepository = userHealthCareProviderMapRepository;
            _permissionRepository = permissionRepository;
            _mapper = mapper;
        }

        public async Task<UserDetails> GetUserDetailsByIdNumber(string idNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = await _userDetailsRepository.Where(a => a.SaId == idNumber || a.PassportNo == idNumber).FirstOrDefaultAsync();
                var userExistInActivation = _userActivationRepository.Any(a => a.Data.Contains(idNumber));

                var userDetails = new UserDetails();
                if (user == null)
                {
                    userDetails.UserExistInActivationTable = userExistInActivation;
                    userDetails.UserProfileType = UserProfileTypeEnum.Individual;
                }
                else
                {
                    userDetails = _mapper.Map<UserDetails>(user);
                    userDetails.UserExistInActivationTable = userExistInActivation;
                }
                return userDetails;
            }
        }

        public async Task<UserBrokerageMap> GetUserBrokerageMap(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _userBrokerageRepository
                    .SingleAsync(s => s.UserId == userId, $"Could not find a user with the id {userId}");
                var model = _mapper.Map<UserBrokerageMap>(entity);
                return model;
            }
        }

        public async Task<UserDetails> GetUserByUserDetailId(int userDetailId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = await _userDetailsRepository.FirstOrDefaultAsync(a => a.UserDetailsId == userDetailId);
                var userDetails = _mapper.Map<UserDetails>(user);

                return userDetails;
            }
        }

        public async Task<bool> RegisterUserDetails(UserDetails userDetails)
        {
            var result = false;
            Contract.Requires(userDetails != null);
            if (userDetails.UserProfileType != UserProfileTypeEnum.HealthcareProvider && userDetails.UserProfileType != UserProfileTypeEnum.Company)
            {
                var brokerage = await _brokerageService.GetBrokerage(userDetails.BrokerageId);
                userDetails.BrokerFspNumber = brokerage.FspNumber;
            }

            userDetails.UserActivation = await CreateMemberActivation(userDetails);

            if (userDetails.UserProfileType == UserProfileTypeEnum.Company && userDetails.PortalType == PortalTypeEnum.RMA)
            {
                var role = await _roleService.GetRoleByName(userDetails.RoleName);
                var userCompanyMap = new UserCompanyMap()
                {
                    RoleId = role.Id,
                    RoleName = userDetails.RoleName,
                    CompanyId = userDetails.RolePlayerId,
                    UserCompanyMapStatus = UserCompanyMapStatusEnum.Pending,
                    UserActivationId = userDetails.UserActivation.UserActivationId
                };
                await _userService.AddUserCompanyMap(userCompanyMap);
            }

            if (userDetails.UserActivation.UserActivationId > 0)
            {
                result = true;
                if (userDetails != null)
                {
                    switch (userDetails.UserProfileType)
                    {
                        case UserProfileTypeEnum.Individual:
                            if (userDetails.IdTypeEnum == IdTypeEnum.SAIDDocument)
                            {
                                result = await _rolePlayerService.UserPlayerVopdRequest(userDetails.SaId);
                                if (!result)
                                {
                                    await SendMemberActivationEmail(userDetails);
                                    result = true;
                                }
                            }
                            else
                            {
                                await OnDocumentUpload(userDetails);
                                await SendConfirmationToNonSAIDMember(userDetails);
                            }
                            break;
                        case UserProfileTypeEnum.Company:
                            await SendMemberActivationEmail(userDetails);
                            break;
                        case UserProfileTypeEnum.Broker:
                            await SendMemberActivationEmail(userDetails);
                            break;
                        case UserProfileTypeEnum.HealthcareProvider:
                            await SendHealthCareProviderRegistrationEmail(userDetails);
                            break;
                    }
                }
            }
            return result;
        }

        public async Task<bool> DeRegisterUserDetails(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var user = await _userService.GetUserByEmail(userDetails?.UserContact?.Email);
                if (user != null)
                {
                    user.IsActive = false;
                    await _userService.EditUser(user);

                    var userBrokerageMap = await _userBrokerageRepository.FirstOrDefaultAsync(t => t.UserId == user.Id);
                    userBrokerageMap.IsLinkedToMemberPortal = false;
                    _userBrokerageRepository.Update(userBrokerageMap);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    var message = await _configurationService.GetModuleSetting(SystemSettings.DelinkMemberPortalMessage);
                    var result = await RejectOnMemberApprovalConfirmation(userDetails, message);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        public async Task<UserActivation> CreateMemberActivation(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);
            var hmac = new HMACSHA512();

            userDetails.UserActivation.ActivationLink = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLink);
            userDetails.UserActivation.ActivationToken = hmac.ComputeHash(Encoding.UTF8.GetBytes(userDetails.UserContact.Email));
            userDetails.UserActivation.ActivationHash = Regex.Replace(Convert.ToBase64String(userDetails.UserActivation.ActivationToken), "[^a-zA-Z0-9_.]+", "");
            userDetails.UserActivation.ActivationExpiryDate = DateTimeHelper.SaNow.AddHours(Convert.ToInt32(await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkValidity)));
            userDetails.UserActivation.Data = JsonConvert.SerializeObject(userDetails);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                security_UserActivation newUserActivation = new security_UserActivation()
                {
                    ActivationExpiryDate = userDetails.UserActivation.ActivationExpiryDate,
                    ActivationHash = userDetails.UserActivation.ActivationHash,
                    ActivationLink = userDetails.UserActivation.ActivationLink,
                    ActivationToken = userDetails.UserActivation.ActivationToken,
                    Data = userDetails.UserActivation.Data
                };

                newUserActivation = _userActivationRepository.Create(newUserActivation);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                userDetails.UserActivation = _mapper.Map<UserActivation>(newUserActivation);
            }
            hmac.Dispose();
            return userDetails.UserActivation;

        }

        public async Task RejectOnMemberApproval(UserDetails userDetails, string rejectMessage)
        {
            Contract.Requires(userDetails != null);
            var result = await RejectOnMemberApprovalConfirmation(userDetails, rejectMessage);
        }

        public async Task OnVopdFailed(UserDetails userDetails)
        {
            throw new NotImplementedException();
        }

        private async Task<int> RejectOnMemberApprovalConfirmation(UserDetails userDetails, string rejectMessage)
        {
            int sendEmail = 0;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var listOfAttachmentIds = new List<int>();
                var memberDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewMemberActivation.DisplayAttributeValue());
                listOfAttachmentIds.Add(memberDoc.DocumentTypeId);
                var documentTemplate = memberDoc.DocumentHtml;

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberMessage}"] = rejectMessage,
                    ["{newMemberSurname}"] = userDetails.Surname,
                    ["{newMemberActivationLink}"] = "",
                    ["{newMemberRegistration}"] = "",
                };
                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "Registration", //TODO: Get correct subject from the BA
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }

            return sendEmail;
        }

        public async Task OnDocumentUpload(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);
            var registerUserDetails = new UserRegistrationDetails();

            registerUserDetails = new UserRegistrationDetails()
            {
                UserDetailsId = userDetails.UserDetailsId,
                SaId = userDetails.SaId,
                PassportNo = userDetails.PassportNo,
                Name = userDetails.Name,
                Surname = userDetails.Surname,
                DateOfBirth = userDetails.DateofBirth != null ? (DateTime)userDetails.DateofBirth : DateTime.MinValue,
                UserProfileType = userDetails.UserProfileType,
                IdTypeEnum = userDetails.IdTypeEnum,
                CompanyRegistrationNumber = userDetails.CompanyRegistrationNumber,
                HealthCareProviderId = userDetails.HealthCareProviderId,
                BrokerFspNumber = userDetails.BrokerFspNumber,
                UserAddress = new UserAddress()
                {
                    UserAddressId = userDetails.UserAddress.UserAddressId,
                    AddressType = userDetails.UserAddress.AddressType,
                    Address1 = userDetails.UserAddress.Address1,
                    Address2 = userDetails.UserAddress.Address2,
                    Address3 = userDetails.UserAddress.Address3,
                    PostalCode = userDetails.UserAddress.PostalCode,
                    City = userDetails.UserAddress.City,
                    Province = userDetails.UserAddress.Province,
                    CountryId = userDetails.UserAddress.CountryId,
                },
                UserContact = new BusinessProcessManager.Contracts.Entities.UserContact()
                {
                    UserContactId = userDetails.UserContact.UserContactId,
                    CellPhoneNo = userDetails.UserContact.CellPhoneNo,
                    TelephoneNo = userDetails.UserContact.TelephoneNo,
                    Email = userDetails.UserContact.Email,
                },
                IsVopdPassed = userDetails.IsVopdPassed,
                PassportExpiryDate = userDetails.PassportExpiryDate
            };


            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stepData = new ArrayList { registerUserDetails };
                var data = _serializerService.Serialize(stepData);

                var parameter = new SqlParameter { ParameterName = "@Data", Value = data };
                const string procedure = DatabaseConstants.GenerateMemberApprovalTask;
                await _userDetailsRepository.ExecuteSqlCommandAsync(procedure, parameter);
            }
        }

        public async Task<int> SendMemberActivationEmail(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewMemberActivation.DisplayAttributeValue());
                var documentTemplate = template.DocumentHtml;

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberSurname}"] = userDetails.Name + " " + userDetails.Surname,
                    ["{newMemberMessage}"] = "Thank you for applying for access to the RMA Self Service Portal. Click the below link to activate your self service user account",
                    ["{newMemberActivationHref}"] = userDetails.UserActivation.ActivationLink + userDetails.UserActivation.ActivationHash,
                    ["{newMemberActivationLink}"] = "Click HERE to activate",
                    ["{newMemberRegistration}"] = userDetails.UserContact.Email
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "RMA Self Service Portal User Activation",
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null,
                    ItemId = userDetails.RolePlayerId,
                    ItemType = "RolePlayer"
                };

                return await _sendEmailService.SendEmail(email);
            }
        }

        public async Task<int> SendHealthCareProviderRegistrationEmail(UserDetails userDetails)
        {
            int sendEmail = 0;
            Contract.Requires(userDetails != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string message = string.Empty;
                string activationHref = string.Empty;
                string activationLink = userDetails.UserActivation.ActivationLink + userDetails.UserActivation.ActivationHash;
                var healthCareProviderDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewHealthCareProviderActivation.DisplayAttributeValue());
                var documentTemplate = healthCareProviderDoc.DocumentHtml;

                message = await _configurationService.GetModuleSetting(SystemSettings.NewHealthCareProviderRegistrationMessage);
                activationLink = userDetails.UserActivation.ActivationLink + userDetails.UserActivation.ActivationHash;
                activationHref = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationHrefVopdSuccess) + userDetails.UserActivation.ActivationHash;

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberMessage}"] = message,
                    ["{newMemberSurname}"] = userDetails.Surname,
                    ["{newMemberActivationHref}"] = activationHref,
                    ["{newMemberActivationLink}"] = activationLink,
                    ["{newMemberRegistration}"] = "",
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "Complete registration",
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }

            return sendEmail;
        }

        private async Task<int> SendFailedVopdEmail(UserDetails userDetails)
        {
            int sendEmail = 0;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var listOfAttachmentIds = new List<int>();
                string activationLink = userDetails.UserActivation.ActivationLink + userDetails.UserActivation.ActivationHash;
                string activationHref = string.Empty;
                string message = string.Empty;
                var memberDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewMemberActivation.DisplayAttributeValue());
                listOfAttachmentIds.Add(memberDoc.DocumentTypeId);
                var documentTemplate = memberDoc.DocumentHtml;

                message = await _configurationService.GetModuleSetting(SystemSettings.NewMemberVopdFailedMessage);
                activationLink = userDetails.UserActivation.ActivationLink + userDetails.UserActivation.ActivationHash;
                activationHref = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationHrefVopdFailure) + userDetails.UserActivation.ActivationHash;

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberMessage}"] = message,
                    ["{newMemberSurname}"] = userDetails.Surname,
                    ["{newMemberActivationHref}"] = activationHref,
                    ["{newMemberActivationLink}"] = activationLink,
                    ["{newMemberRegistration}"] = "",
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "Failed Identity Check", //TODO: Get correct subject from the BA
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }

            return sendEmail;
        }

        public async Task<int> SendConfirmationToNonSAIDMember(UserDetails userDetails)
        {
            int sendEmail = 0;
            Contract.Requires(userDetails != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var listOfAttachmentIds = new List<int>();
                var memberDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewNonSAIdMemberConfirmation.DisplayAttributeValue());
                listOfAttachmentIds.Add(memberDoc.DocumentTypeId);
                var documentTemplate = memberDoc.DocumentHtml;

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberSurname}"] = userDetails.Surname,
                    ["{newMemberRegistration}"] = "",
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "Registration", //TODO: Get correct subject from the BA
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }
            return sendEmail;
        }

        private async Task<int> CreateUserDetails(UserDetails userDetails, int userActivationId)
        {
            Contract.Requires(userDetails != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                int userDetailsId = 0;
                var user = await _userService.GetUserByEmail(userDetails.UserContact.Email);
                if (user == null)
                {
                    var newMemberId = await CreateUser(userDetails);
                    int newMemberAddressId = 0;
                    int newMemberContactId = 0;

                    if (userDetails.UserProfileType != UserProfileTypeEnum.Company)
                    {
                        if (userDetails.UserProfileType == UserProfileTypeEnum.Broker)
                        {
                            newMemberContactId = await CreateMemberContact(userDetails, newMemberId);
                        }
                        else
                        {
                            //TODO - Sit with Mike to use _mapper and Save
                            newMemberAddressId = await CreateMemberAddress(userDetails, newMemberId);
                            newMemberContactId = await CreateMemberContact(userDetails, newMemberId);
                        }
                    }

                    if (userDetails.UserProfileType == UserProfileTypeEnum.HealthcareProvider)
                    {
                        await CreateUserHealthCareProviderMap(userDetails, newMemberId);

                    }

                    security_UserDetail userDetail = new security_UserDetail();
                    userDetail.DateofBirth = userDetails.DateofBirth;

                    userDetail.UserProfileType = userDetails.UserProfileType;

                    userDetail.Name = userDetails.Name;
                    userDetail.PassportNo = userDetails.PassportNo;
                    userDetail.SaId = userDetails.SaId;
                    userDetail.Surname = userDetails.Surname;
                    userDetail.UserActivationId = userActivationId;
                    userDetail.UserAddressId = newMemberAddressId;
                    userDetail.UserContactId = newMemberContactId;
                    userDetail.UserId = newMemberId;
                    userDetail.PassportExpiryDate = userDetails.PassportExpiryDate;

                    var result = _userDetailsRepository.Create(userDetail);

                    var userActivation = await _userActivationRepository.Where(a => a.UserActivationId == userActivationId).FirstOrDefaultAsync();
                    userActivation.MemberActivated = true;
                    _userActivationRepository.Update(userActivation);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    userDetailsId = result.UserDetailsId;
                }
                else
                {
                    userDetailsId = await UpdateUser(userDetails);
                }
                return userDetailsId;
            }
        }

        public async Task<string> CreateNewMember(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var activationData = JsonConvert.DeserializeObject<UserDetails>(userDetails.UserActivation.Data);
                var userActivationDetails = await _userActivationRepository.Where(a => a.ActivationHash == activationData.UserActivation.ActivationHash).FirstOrDefaultAsync();

                var result = await ActivateMember(userActivationDetails.ActivationHash, userDetails);
                return result;
            }
        }

        public async Task<bool> ResendUserActivation(string activateId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivationDetails = await _userActivationRepository
                    .FirstOrDefaultAsync(a => a.ActivationHash == activateId);

                if (userActivationDetails == null) return false;

                var hmac = new HMACSHA512();

                var activationData = JsonConvert.DeserializeObject<UserDetails>(userActivationDetails.Data);
                userActivationDetails.ActivationToken = hmac.ComputeHash(Encoding.UTF8.GetBytes(activationData.UserContact.Email));
                userActivationDetails.ActivationHash = Regex.Replace(Convert.ToBase64String(userActivationDetails.ActivationToken), "[^a-zA-Z0-9_.]+", "");
                userActivationDetails.ActivationExpiryDate = DateTime.Now.AddHours(Convert.ToInt32(await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkValidity)));

                activationData.UserActivation = _mapper.Map<UserActivation>(userActivationDetails);
                userActivationDetails.Data = JsonConvert.SerializeObject(activationData);

                _userActivationRepository.Update(userActivationDetails);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                var userDetails = new UserDetails
                {
                    UserActivation = _mapper.Map<UserActivation>(userActivationDetails),
                    UserContact =
                    {
                        Email = activationData.UserContact.Email
                    },
                    Name = activationData.Name,
                    Surname = activationData.Surname
                };
                hmac.Dispose();
                var result = await SendMemberActivationEmail(userDetails);
                return true;
            }
        }

        public async Task<string> ActivateMember(string ActivateId, UserDetails userDetails)
        {
            Contract.Requires(ActivateId != null);
            Contract.Requires(userDetails != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivationDetails = await _userActivationRepository.Where(a => a.ActivationHash == ActivateId).FirstOrDefaultAsync();

                var listOfAttachmentIds = new List<int>();
                var memberDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewMemberConfirmation.DisplayAttributeValue());
                listOfAttachmentIds.Add(memberDoc.DocumentTypeId);
                var documentTemplate = memberDoc.DocumentHtml;
                string userMessage = string.Empty;

                if (userActivationDetails == null)
                {
                    userMessage = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkInvalid);
                }
                else if (userActivationDetails.ActivationExpiryDate < DateTime.Now)
                {
                    userMessage = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkInactive);
                }
                else
                {
                    var newMember = await CreateUserDetails(userDetails, userActivationDetails.UserActivationId);
                    userMessage = "User activation was completed successfully. You are now able to access the RMA Portal. Use username: " + userDetails.UserContact.Email + " to login";
                }

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberSurname}"] = userDetails.Name + " " + userDetails.Surname + "  (Username: " + userDetails.UserContact.Email + ")",
                    ["{registrationConfirmationMessage}"] = userMessage,
                    ["{newMemberRegistration}"] = "Username: " + userDetails.UserContact.Email
                };

                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = userDetails.UserProfileType == UserProfileTypeEnum.HealthcareProvider ? "RMA Medical User Activated" : "RMA Self Service User Activated",
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null,
                    ItemId = userDetails.RolePlayerId,
                    ItemType = "RolePlayer"
                };

                var sendEmail = await _sendEmailService.SendEmail(email);
                return userMessage;
            }
        }

        public async Task<UserDetails> GetMemberDetailsByActivateId(string activateId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivationDetails = await _userActivationRepository.Where(a => a.ActivationHash == activateId).FirstOrDefaultAsync();

                UserDetails userDetails = new UserDetails();
                if (userActivationDetails == null)
                {
                    userDetails.UserActivationLinkIsActive = false;
                    userDetails.UserActivationMessage = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkInvalid);
                }
                else if (userActivationDetails.ActivationExpiryDate < DateTime.Now)
                {
                    var activationData = JsonConvert.DeserializeObject<UserDetails>(userActivationDetails.Data);
                    userDetails.UserActivationLinkIsActive = false;
                    userDetails.UserProfileType = activationData.UserProfileType;
                    userDetails.UserDetailsId = activationData.UserDetailsId;
                    userDetails.PortalType = activationData.PortalType;
                    userDetails.UserActivationMessage = await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkInactive);
                }
                else
                {
                    var activationData = JsonConvert.DeserializeObject<UserDetails>(userActivationDetails.Data);
                    userDetails = _mapper.Map<UserDetails>(activationData);
                    userDetails.UserActivationLinkIsActive = true;
                    userDetails.UserActivation.Data = userActivationDetails.Data;
                    userDetails.UserDetailsId = activationData.UserDetailsId;
                    userDetails.PortalType = activationData.PortalType;
                    userDetails.UserActivation = _mapper.Map<UserActivation>(userActivationDetails);
                    userDetails.UserActivation.Id = userDetails.UserActivation.UserActivationId;
                }

                return userDetails;
            }
        }

        public async Task ProcessVopdResponse()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var processedVopdResponses = await _rolePlayerService.GetProcessedUserVopdResponse();

                foreach (var processedVopdResponse in processedVopdResponses)
                {
                    try
                    {
                        var userActivationLink = await _userActivationRepository
                            .Where(a => a.Data.Contains(processedVopdResponse.IdNumber)).FirstOrDefaultAsync();
                        if (!string.IsNullOrEmpty(userActivationLink.Data))
                        {
                            var userDetails = JsonConvert.DeserializeObject<UserDetails>(userActivationLink.Data);

                            switch (userDetails.UserProfileType)
                            {
                                case UserProfileTypeEnum.Individual:
                                    if (string.Equals(processedVopdResponse.Reason, "alive", StringComparison.CurrentCultureIgnoreCase))
                                    {
                                        var sentActivationLink = await SendMemberActivationEmail(userDetails);
                                        if (sentActivationLink == 200)
                                        {
                                            processedVopdResponse.IsProcessed = true;
                                            await _rolePlayerService.UpdateUserVopdIsProcessed(processedVopdResponse);
                                        }
                                        else
                                        {
                                            processedVopdResponse.IsProcessed = false;
                                            await _rolePlayerService.UpdateUserVopdIsProcessed(processedVopdResponse);
                                        }
                                    }
                                    else
                                    {
                                        processedVopdResponse.IsProcessed = true;
                                        await _rolePlayerService.UpdateUserVopdIsProcessed(processedVopdResponse);
                                        await SendFailedVopdEmail(userDetails);
                                    }
                                    break;
                                case UserProfileTypeEnum.Company: break;
                                case UserProfileTypeEnum.Broker:
                                    if (string.Equals(processedVopdResponse.Reason, "alive", StringComparison.CurrentCultureIgnoreCase))
                                    {
                                        userDetails.IsVopdPassed = true;

                                        userActivationLink.Data = JsonConvert.SerializeObject(userDetails);
                                        _userActivationRepository.Update(userActivationLink);
                                        await scope.SaveChangesAsync().ConfigureAwait(false);

                                        await OnDocumentUpload(userDetails);
                                        await SendConfirmationToNonSAIDMember(userDetails);

                                        processedVopdResponse.IsProcessed = true;
                                        await _rolePlayerService.UpdateUserVopdIsProcessed(processedVopdResponse);
                                    }
                                    else
                                    {
                                        processedVopdResponse.IsProcessed = true;
                                        await _rolePlayerService.UpdateUserVopdIsProcessed(processedVopdResponse);
                                        await SendFailedVopdEmail(userDetails);
                                    }
                                    break;
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        e.LogException();
                    }
                }
            }
        }

        public async Task<int> CreateUser(UserDetails userDetails)
        {
            if (userDetails == null) { return await Task.FromResult(0); }

            using (var scope = _dbContextScopeFactory.Create())
            {

                var user = await _userService.GetUserByEmail(userDetails.UserContact.Email);

                if (user != null)
                {
                    return await Task.FromResult(user.Id);
                }

                var role = new Role { Id = 0 };
                string userProfileTypeRole;
                var portalType = PortalTypeEnum.RMA;

                switch (userDetails.UserProfileType)
                {
                    case UserProfileTypeEnum.Individual:
                        userProfileTypeRole = await _configurationService.GetModuleSetting(SystemSettings.MemberPortalRoleIndividual);
                        role = await _roleService.GetRoleByName(userProfileTypeRole);
                        portalType = PortalTypeEnum.Member;
                        break;
                    case UserProfileTypeEnum.Broker:
                        role = await _roleService.GetRoleByName(userDetails.RoleName);
                        userDetails.IsInternalUser = false;
                        userDetails.Name = $"{userDetails.Name} {userDetails.Surname}";
                        portalType = PortalTypeEnum.Broker;
                        break;
                    case UserProfileTypeEnum.HealthcareProvider:
                        userProfileTypeRole = await _configurationService.GetModuleSetting(SystemSettings.DigiFormCapturerRole);
                        role = await _roleService.GetRoleByName(userProfileTypeRole);
                        portalType = PortalTypeEnum.HCP;
                        break;
                    case UserProfileTypeEnum.Company:
                        var roleName = userDetails.RoleName != null ? userDetails.RoleName : await _configurationService.GetModuleSetting(SystemSettings.MemberRole);
                        role = await _roleService.GetRoleByName(roleName);
                        portalType = PortalTypeEnum.RMA;
                        break;
                }

                var newMember = new User
                {
                    TenantId = (int)NewMemberTenantType.RMA,
                    PortalType = portalType,
                    DisplayName = userDetails.Name + " " + userDetails.Surname,
                    Name = userDetails.Name,
                    Email = userDetails.UserContact.Email,
                    UserName = userDetails.UserContact.Email,
                    AuthenticationType = AuthenticationTypeEnum.FormsAuthentication,
                    RoleId = role.Id,
                    IsActive = true,
                    Password = userDetails.Password.ComputeHashSHA512(),
                    HashAlgorithm = DefaultHashAlgorithm,
                    IsInternalUser = userDetails.IsInternalUser
                };

                var newMemberId = await _userService.AddUser(newMember);

                if (userDetails.UserProfileType == UserProfileTypeEnum.Broker)
                {
                    var brokerageId = userDetails.BrokerageId;
                    if (userDetails.BrokerageId < 1)
                    {
                        brokerageId = await CheckIfBrokerageExists(userDetails.BrokerFspNumber);
                    }

                    var userMap = new security_UserBrokerageMap()
                    {
                        BrokerageId = brokerageId,
                        UserId = newMemberId,
                        IsLinkedToMemberPortal = true,
                    };
                    _userBrokerageRepository.Create(userMap);
                   
                }
                else if (userDetails.UserProfileType == UserProfileTypeEnum.Company && portalType == PortalTypeEnum.RMA)
                {
                    var userCompanyMaps = await _userService.GetUserCompanyMapsByUserActivationId(userDetails.UserActivation.Id);

                    foreach (var userCompanyMap in userCompanyMaps)
                    {
                        userCompanyMap.UserId = newMemberId;
                        userCompanyMap.UserCompanyMapStatus = UserCompanyMapStatusEnum.Active;

                        await _userService.EditUserCompanyMap(userCompanyMap);
                    }

                    var userActivation = await _userActivationRepository.FirstOrDefaultAsync(a => a.UserActivationId == userDetails.UserActivation.Id);

                    if (userActivation != null)
                    {
                        var data = JsonConvert.DeserializeObject<UserDetails>(userActivation.Data);

                        if (data.UserContact != null)
                        {
                            var userContact = new UserContact()
                            {
                                CellPhoneNo = data.UserContact.CellPhoneNo,
                                Email = data.UserContact.Email,
                                TelephoneNo = data.UserContact.TelephoneNo,
                                UserId = newMemberId
                            };

                            await _userService.AddUserContact(userContact);
                        }
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return newMemberId;
            }
        }

        private async Task AddBrokerUserPermission(int newMemberId, string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var permissionName = await _configurationService.GetModuleSetting(name);
                var permissionId = await _permissionRepository.Where(p => p.Name == permissionName).Select(a => a.Id).FirstOrDefaultAsync();

                var user = await _userService.GetUserById(newMemberId);
                user.PermissionIds.Add(permissionId);

                await _userService.EditUser(user);
            }
        }

        public async Task<int> UpdateUser(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var updateUserId = await _userService.UpdateUserPassword(userDetails.UserContact.Email, userDetails.Password);

                var userBrokerageMap = await _userBrokerageRepository.FirstOrDefaultAsync(userBroker => userBroker.UserId == updateUserId);
                if (userBrokerageMap != null)
                {
                    userBrokerageMap.IsLinkedToMemberPortal = true;
                    _userBrokerageRepository.Update(userBrokerageMap);
                }

                var userActivationDetails = await _userActivationRepository.Where(a => a.ActivationHash == userDetails.UserActivation.ActivationHash).FirstOrDefaultAsync();
                userActivationDetails.MemberActivated = true;
                _userActivationRepository.Update(userActivationDetails);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return updateUserId;
            }
        }

        private async Task<int> CreateMemberAddress(UserDetails userDetails, int userId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivation = await _userActivationRepository.Where(a => a.ActivationHash == userDetails.UserActivation.ActivationHash).FirstOrDefaultAsync();
                var activationDetails = JsonConvert.DeserializeObject<UserDetails>(userActivation.Data);
                if (userDetails.UserProfileType != UserProfileTypeEnum.HealthcareProvider)
                {
                    security_UserAddress userAddress = new security_UserAddress();
                    userAddress.Address1 = activationDetails.UserAddress.Address1;
                    userAddress.Address2 = activationDetails.UserAddress.Address2;
                    userAddress.Address3 = activationDetails.UserAddress.Address3;
                    userAddress.AddressType = activationDetails.UserAddress.AddressType;
                    userAddress.City = activationDetails.UserAddress.City;
                    userAddress.CountryId = activationDetails.UserAddress.CountryId;
                    userAddress.PostalCode = activationDetails.UserAddress.PostalCode;
                    userAddress.Province = activationDetails.UserAddress.Province;
                    userAddress.UserId = userId;

                    _userAddressRepository.Create(userAddress);
                    return userAddress.UserAddressId;
                }
                else
                    return 0;
            }
        }

        private async Task<int> CreateMemberContact(UserDetails userDetails, int userId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivation = await _userActivationRepository.Where(a => a.ActivationHash == userDetails.UserActivation.ActivationHash).FirstOrDefaultAsync();
                var activationDetails = JsonConvert.DeserializeObject<UserDetails>(userActivation.Data);

                security_UserContact userContact = new security_UserContact();
                userContact.CellPhoneNo = activationDetails.UserContact.CellPhoneNo;
                userContact.Email = activationDetails.UserContact.Email;
                userContact.TelephoneNo = activationDetails.UserContact.TelephoneNo;
                userContact.UserId = userId;

                _userContactRepository.Create(userContact);
                return userContact.UserContactId;
            }
        }

        private async Task CreateUserHealthCareProviderMap(UserDetails userDetails, int userId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivation = await _userActivationRepository.Where(a => a.ActivationHash == userDetails.UserActivation.ActivationHash).FirstOrDefaultAsync();

                security_UserHealthCareProviderMap userHealthCareProviderMap = new security_UserHealthCareProviderMap();
                userHealthCareProviderMap.UserId = userId;
                userHealthCareProviderMap.HealthCareProviderId = userDetails.HealthCareProviderId;
                userHealthCareProviderMap.IsActive = true;

                _userHealthCareProviderMapRepository.Create(userHealthCareProviderMap);
            }
        }

        public async Task<UserDetails> GetUserDetailsByEmail(string emailAddress)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userDetails = new UserDetails();

                var userExistInActivation = _userActivationRepository.Any(a => a.Data.Contains(emailAddress));
                if (userExistInActivation)
                {
                    userDetails.UserExistInActivationTable = userExistInActivation;
                }

                var user = await _userService.GetUserByEmail(emailAddress);

                if (user != null)
                {
                    var result = await _userDetailsRepository.FirstOrDefaultAsync(a => a.UserId == user.Id);
                    if (result != null)
                    {
                        userDetails = _mapper.Map<UserDetails>(result);
                        userDetails.UserExistInActivationTable = userExistInActivation;
                        userDetails.UserId = result.UserId;
                    }
                }
                else
                {
                    userDetails.UserProfileType = UserProfileTypeEnum.Individual;
                }

                return userDetails;
            }

        }

        public async Task<bool> SendMemberPasswordResetLink(string emailAddress)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var user = await _userService.GetUserByEmail(emailAddress);
                var memberDetails = await _userDetailsRepository.FirstOrDefaultAsync(a => a.UserId == user.Id);
                var userContact = await _userContactRepository.FirstOrDefaultAsync(a => a.UserId == user.Id);

                var userActivationDetails = await _userActivationRepository
                    .FirstOrDefaultAsync(a => a.UserActivationId == memberDetails.UserActivationId);

                if (userActivationDetails == null) return false;

                var hmac = new HMACSHA512();
                var activationData = JsonConvert.DeserializeObject<UserDetails>(userActivationDetails.Data);
                userActivationDetails.ActivationToken = hmac.ComputeHash(Encoding.UTF8.GetBytes(emailAddress));
                userActivationDetails.ActivationHash = Regex.Replace(Convert.ToBase64String(userActivationDetails.ActivationToken), "[^a-zA-Z0-9_.]+", "");
                userActivationDetails.ActivationExpiryDate = DateTime.Now.AddMinutes(Convert.ToInt32(await _configurationService.GetModuleSetting(SystemSettings.MemberPasswordResetLinkValidity)));

                _userActivationRepository.Update(userActivationDetails);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                UserDetails userDetails = new UserDetails();
                userDetails.UserActivation = _mapper.Map<UserActivation>(userActivationDetails);
                userDetails.Name = activationData.Name;
                userDetails.Surname = activationData.Surname;
                userDetails.UserContact = _mapper.Map<Contracts.Entities.UserContact>(userContact);
                hmac.Dispose();
                var result = await SendPasswordResetEmail(userDetails);
                return true;
            }
        }

        public async Task<int> SendPasswordResetEmail(UserDetails userDetails)
        {
            int sendEmail = 0;
            Contract.Requires(userDetails != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var listOfAttachmentIds = new List<int>();
                string activationLink = await _configurationService.GetModuleSetting(SystemSettings.MemberPasswordResetLink) + userDetails.UserActivation.ActivationHash;
                string message = await _configurationService.GetModuleSetting(SystemSettings.MemberPasswordResetMessage);
                var memberDoc = await _documentTemplateService.GetDocumentTemplateByName(DocumentTypeEnum.NewMemberActivation.DisplayAttributeValue());
                listOfAttachmentIds.Add(memberDoc.DocumentTypeId);
                var documentTemplate = memberDoc.DocumentHtml;

                var documentTokens = new Dictionary<string, string>
                {
                    ["{newMemberMessage}"] = message,
                    ["{newMemberSurname}"] = userDetails.Surname,
                    ["{newMemberActivationHref}"] = activationLink,
                    ["{newMemberActivationLink}"] = activationLink,
                    ["{newMemberRegistration}"] = "",
                };
                foreach (var token in documentTokens)
                {
                    documentTemplate = documentTemplate.Replace($"{token.Key}", token.Value);
                }

                var email = new SendMailRequest()
                {
                    Subject = "Reset Password", //TODO: Get correct subject from the BA
                    FromAddress = await _configurationService.GetModuleSetting(SystemSettings.ClaimsManagerEmailNotificationSender),
                    Recipients = userDetails.UserContact.Email,
                    Body = documentTemplate,
                    IsHtml = true,
                    Attachments = null
                };

                sendEmail = await _sendEmailService.SendEmail(email);
            }

            return sendEmail;
        }

        public async Task<int> UpdateMember(UserDetails userDetails)
        {
            Contract.Requires(userDetails != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var activationData = JsonConvert.DeserializeObject<UserDetails>(userDetails.UserActivation.Data);
                var userActivationDetails = await _userActivationRepository.FirstOrDefaultAsync(a => a.ActivationHash == activationData.UserActivation.ActivationHash);

                return await _userService.UpdateUserPassword(userDetails.UserContact.Email, userDetails.Password);

            }
        }

        public async Task<int> CheckIfBrokerageExists(string fspNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerId = 0;
                var broker = await _brokerageService.GetBrokerageByFSPNumber(fspNumber);
                if (broker != null)
                {
                    brokerId = broker.Id;
                }
                return brokerId;
            }
        }

        public async Task<string> GetUserDetailsVopdResponse(string idNumber)
        {
            var result = await _rolePlayerService.GetUserVopdResponseMessage(idNumber);
            return result.Reason != null ? result.Reason : "VOPD has not processed provided ID Number";

        }

        public async Task<UserActivation> GetUserActivation(string idNumber, string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userActivation = await _userActivationRepository.FirstOrDefaultAsync(a => a.Data.Contains(idNumber) && a.Data.Contains(email));
                return _mapper.Map<UserActivation>(userActivation);
            }
        }

        public async Task<UserDetails> GetUserActivationUserDetailsByUserActivationId(int userActivationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userActivation = await _userActivationRepository.FirstOrDefaultAsync(a => a.UserActivationId == userActivationId);

                var userDetails = JsonConvert.DeserializeObject<UserDetails>(userActivation.Data);
                return userDetails;
            }
        }

        public async Task<bool> CheckIfBrokerIsLinkedToMemberPortal(string email)
        {
            if (string.IsNullOrEmpty(email)) return false;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var isLinked = false;
                var user = await _userService.GetUserByEmail(email);
                if (user != null)
                {
                    var userBrokerageMapping = await _userBrokerageRepository.FirstOrDefaultAsync(a => a.UserId == user.Id);
                    if (userBrokerageMapping != null)
                    {
                        isLinked = userBrokerageMapping.UserId != 0 ? userBrokerageMapping.IsLinkedToMemberPortal : false;
                    }
                    return isLinked;
                }

                var userContactDetails = await _userContactRepository.FirstOrDefaultAsync(a => a.Email == email);
                if (userContactDetails != null)
                {
                    var userBrokerageMapping = await _userBrokerageRepository.FirstOrDefaultAsync(a => a.UserId == user.Id);
                    isLinked = userBrokerageMapping.UserId != 0 ? userBrokerageMapping.IsLinkedToMemberPortal : false;
                }
                return isLinked;
            }
        }

        public async Task<bool> CheckIfBrokerHasActivatedLinkCreated(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var isCreated =
                    await _userActivationRepository.AnyAsync(a => a.Data.Contains(email) && a.MemberActivated == false);
                return isCreated;
            }
        }

        public async Task<string> GetUserActivateId(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return (await _userActivationRepository.FirstOrDefaultAsync(a => a.Data.Contains(email) && a.MemberActivated == false))?.ActivationHash;
            }
        }

        public async Task<bool> ResendUserActivationEmail(int userActivationId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userActivation = await _userActivationRepository.FirstOrDefaultAsync(a => a.UserActivationId == userActivationId);
                if (userActivation == null) return false;

                userActivation.ActivationExpiryDate = DateTime.Now.AddHours(Convert.ToInt32(await _configurationService.GetModuleSetting(SystemSettings.NewMemberActivationLinkValidity)));

                _userActivationRepository.Update(userActivation);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                var userDetails = JsonConvert.DeserializeObject<UserDetails>(userActivation.Data);
                userDetails.UserActivation = _mapper.Map<UserActivation>(userActivation);

                var result = await SendMemberActivationEmail(userDetails);
                return true;
            }
        }

        public async Task<bool> IsUserPendingRegistration(string userName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var userActivations = await _userActivationRepository
                        .Where(c => c.Data.Contains(userName) && !c.MemberActivated).ToListAsync();

                    return userActivations.Count > 0;
                }
            }
        }

        public async Task<int> GetPendingUserActivation(string userName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var userActivation = await _userActivationRepository
                        .FirstOrDefaultAsync(c => c.Data.Contains(userName) && !c.MemberActivated);

                    return userActivation != null ? userActivation.UserActivationId : -1;
                }
            }
        }
    }
}