using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;

using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Services.Member
{
    public class MemberFacade : RemotingStatelessService, IMemberService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<client_Company> _companyRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IUserService _userService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly INatureOfBusinessService _natureOfBusinessService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IRepository<client_IndustryClassRenewal> _industryClassRenewalRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IEmailService _emailService;
        private readonly IRepository<client_RolePlayerContactInformation> _rolePlayerContactInformationRepository;
        private readonly IRepository<client_RolePlayerContact> _rolePlayerContactRepository;
        private readonly ISLAService _slaService;
        private readonly IPolicyService _policyService;
        private readonly IProductService _productService;
        private readonly IRepository<client_PersonEmployment> _personEmploymentRepository;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public MemberFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRolePlayerService rolePlayerService,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<client_Company> companyRepository,
            IRepository<client_Person> personRepository,
            IDocumentGeneratorService documentGeneratorService,
            IUserService userService,
            IRepository<client_FinPayee> finPayeeRepository,
            IConfigurationService configurationService,
            INatureOfBusinessService natureOfBusinessService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IRepository<client_IndustryClassRenewal> industryClassRenewalRepository,
            IEmailService emailService,
            IRepository<client_RolePlayerContactInformation> rolePlayerContactInformationRepository,
            IRepository<client_RolePlayerContact> rolePlayerContactRepository,
            ISLAService slaService,
            IPolicyService policyService,
            IProductService productService,
            IRepository<client_PersonEmployment> personEmploymentRepository) : base(context)

        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerService = rolePlayerService;
            _rolePlayerRepository = rolePlayerRepository;
            _companyRepository = companyRepository;
            _personRepository = personRepository;
            _documentGeneratorService = documentGeneratorService;
            _userService = userService;
            _finPayeeRepository = finPayeeRepository;
            _configurationService = configurationService;
            _natureOfBusinessService = natureOfBusinessService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _industryClassRenewalRepository = industryClassRenewalRepository;
            _emailService = emailService;
            _rolePlayerContactInformationRepository = rolePlayerContactInformationRepository;
            _rolePlayerContactRepository = rolePlayerContactRepository;
            _slaService = slaService;
            _policyService = policyService;
            _productService = productService;
            _personEmploymentRepository = personEmploymentRepository;
        }

        public async Task<int> CreateMember(Roleplayer rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _rolePlayerService.CreateRolePlayer(rolePlayer);

                var slaStatusChangeAudit = new SlaStatusChangeAudit
                {
                    SLAItemType = SLAItemTypeEnum.Member,
                    ItemId = rolePlayer.RolePlayerId,
                    Status = rolePlayer.MemberStatus.ToString(),
                    EffectiveFrom = DateTimeHelper.SaNow,
                    Reason = "new member was created"
                };

                await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                return result;
            }
        }

        public async Task UpdateMember(Roleplayer rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            var entity = await GetMemberById(rolePlayer.RolePlayerId);
            await _rolePlayerService.EditRolePlayer(rolePlayer);

            var rolePlayerModelStatus = rolePlayer.MemberStatus;
            var originalStatus = entity.MemberStatus;
            var isStatusChanged = originalStatus != rolePlayerModelStatus;

            if (isStatusChanged && originalStatus != MemberStatusEnum.Active && originalStatus != MemberStatusEnum.Inactive)
            {
                var slaStatusChangeAudit = new SlaStatusChangeAudit
                {
                    SLAItemType = SLAItemTypeEnum.Member,
                    ItemId = entity.RolePlayerId,
                    Status = rolePlayer.MemberStatus.ToString(),
                    EffectiveFrom = DateTimeHelper.SaNow,
                    Reason = $"member status updated from {originalStatus} to {rolePlayerModelStatus}"
                };

                DateTime? effectiveTo = null;
                if (entity.MemberStatus == MemberStatusEnum.ActiveWithoutPolicies || entity.MemberStatus == MemberStatusEnum.Cancelled || entity.MemberStatus == MemberStatusEnum.Inactive || entity.MemberStatus == MemberStatusEnum.Active)
                {
                    effectiveTo = DateTimeHelper.SaNow;
                }

                slaStatusChangeAudit.EffictiveTo = effectiveTo;

                await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
            }
        }

        public async Task<Roleplayer> GetMemberById(int id)
        {
            Roleplayer member = null;
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);
            if (id > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    member = await GetRolePlayer(id);

                    if (member != null)
                    {
                        var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(id);

                        if (policies?.Count > 0)
                        {
                            member.HasActiveFuneralPolicies = policies.Any(s => (s.PolicyStatus == PolicyStatusEnum.Active || s.PolicyStatus == PolicyStatusEnum.PendingCancelled) && s.ProductCategoryType == ProductCategoryTypeEnum.Funeral);
                            member.HasActiveVapsPolicies = policies.Any(s => (s.PolicyStatus == PolicyStatusEnum.Active || s.PolicyStatus == PolicyStatusEnum.PendingCancelled) && (s.ProductCategoryType == ProductCategoryTypeEnum.VapsAssistance || s.ProductCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory));
                            member.HasActiveCoidPolicies = policies.Any(s => (s.PolicyStatus == PolicyStatusEnum.Active || s.PolicyStatus == PolicyStatusEnum.PendingCancelled) && s.ProductCategoryType == ProductCategoryTypeEnum.Coid);
                        }
                    }

                    return member;
                }
            }
            return member;
        }

        private async Task<Roleplayer> GetRolePlayer(int rolePlayerId)
        {
            Roleplayer result=null;
            if (rolePlayerId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _rolePlayerRepository.FirstOrDefaultAsync(s => s.RolePlayerId == rolePlayerId);
                    if (entity != null)
                    {
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerAddresses);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerBankingDetails);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.HealthCareProvider);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerContacts);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.FinPayee);
                        await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerNotes);
                        await _rolePlayerContactRepository.LoadAsync(entity.RolePlayerContacts, rp => rp.RolePlayerContactInformations);
                    }
                    result= Mapper.Map<Roleplayer>(entity);
                }
            }
            return result;
        }

        public async Task<List<Company>> GetCompaniesByCompanyLevel(CompanyLevelEnum companyLevel)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var companies = await _companyRepository.Where(s => s.CompanyLevel == companyLevel).ToListAsync();
                return Mapper.Map<List<Company>>(companies);
            }
        }

        public async Task<List<Company>> GetSubsidiaries(int roleplayerId)
        {
            List<Company> subsidiaryList = null;
            if (roleplayerId > 0)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var companies = await _companyRepository.Where(s => s.LinkedCompanyId == roleplayerId).ToListAsync();
                    subsidiaryList = Mapper.Map<List<Company>>(companies);

                    foreach (var subsidiary in subsidiaryList)
                    {
                        var finPayee = await _rolePlayerService.GetFinPayee(subsidiary.RolePlayerId);
                        subsidiary.FinPayeNumber = finPayee.FinPayeNumber;
                        subsidiary.RolePlayerPolicies = await _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(subsidiary.RolePlayerId);
                    }
                }
            }
            return subsidiaryList;
        }

        public async Task<PagedRequestResult<MemberSearch>> GetPagedMembers(PagedRequest request)
        {
            Contract.Requires(request != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewClient);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var memberSearch = new PagedRequestResult<MemberSearch>();

                if (string.IsNullOrEmpty(request.SearchCriteria))
                {


                    memberSearch = await _rolePlayerRepository
                    .Join(_companyRepository, x => x.RolePlayerId, y => y.RolePlayerId, (x, y) => new { x.RolePlayerId, x.DisplayName, x.CreatedDate, y.CompensationFundReferenceNumber, y.IdNumber })
                    .Join(_finPayeeRepository, y => y.RolePlayerId, finpayee => finpayee.RolePlayerId, (y, finpayee) => new { y.IdNumber, y.RolePlayerId, y.DisplayName, y.CreatedDate, finpayee.FinPayeNumber, y.CompensationFundReferenceNumber, finpayee.IndustryId })
                    .Select(x => new MemberSearch
                    {
                        MemberName = x.DisplayName,
                        CompanyRegistrationNumber = x.IdNumber,
                        CompensationFundReferenceNumber = x.CompensationFundReferenceNumber,
                        MemberNumber = x.FinPayeNumber,
                        RolePlayerId = x.RolePlayerId,
                        CreatedDate = x.CreatedDate,
                        IndustryId = x.IndustryId.HasValue ? x.IndustryId.Value : 0
                    }).ToPagedResult(request);
                }
                else
                {
                    memberSearch = await _rolePlayerRepository
                        .Join(_companyRepository, x => x.RolePlayerId, y => y.RolePlayerId, (x, y) => new { x.RolePlayerId, x.DisplayName, x.CreatedDate, y.ReferenceNumber, y.CompensationFundReferenceNumber, y.IdNumber })
                        .Join(_finPayeeRepository, y => y.RolePlayerId, finpayee => finpayee.RolePlayerId, (y, finpayee) => new { y.IdNumber, y.RolePlayerId, y.DisplayName, y.CreatedDate, finpayee.FinPayeNumber, y.CompensationFundReferenceNumber, finpayee.IndustryId })
                        .Where(x =>
                                x.CompensationFundReferenceNumber.Contains(request.SearchCriteria) ||
                                x.DisplayName.Contains(request.SearchCriteria) ||
                                x.FinPayeNumber.Contains(request.SearchCriteria) ||
                                x.IdNumber.Contains(request.SearchCriteria))
                        .Select(x => new MemberSearch
                        {
                            MemberName = x.DisplayName,
                            CompanyRegistrationNumber = x.IdNumber,
                            CompensationFundReferenceNumber = x.CompensationFundReferenceNumber,
                            MemberNumber = x.FinPayeNumber,
                            RolePlayerId = x.RolePlayerId,
                            CreatedDate = x.CreatedDate,
                            IndustryId = x.IndustryId.HasValue ? x.IndustryId.Value : 0
                        }).ToPagedResult(request);
                }

                if (memberSearch.Data.Count == 0)
                    return new PagedRequestResult<MemberSearch>();
                return new PagedRequestResult<MemberSearch>()
                {
                    PageSize = memberSearch.PageSize,
                    Page = memberSearch.Page,
                    PageCount = memberSearch.PageCount,
                    RowCount = memberSearch.RowCount,
                    Data = memberSearch.Data
                };
            }
        }

        public async Task<PagedRequestResult<Roleplayer>> SearchMembers(int industryClassId, int clientTypeId, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var filter = !string.IsNullOrEmpty(pagedRequest.SearchCriteria) ? Convert.ToString(pagedRequest.SearchCriteria).ToUpper() : string.Empty;

                var industryClassFilters = industryClassId > 0 ? new List<IndustryClassEnum> { (IndustryClassEnum)industryClassId } : Enum.GetValues(typeof(IndustryClassEnum)).Cast<IndustryClassEnum>().ToList();
                var clientTypeFilters = clientTypeId > 0 ? new List<ClientTypeEnum> { (ClientTypeEnum)clientTypeId } : Enum.GetValues(typeof(ClientTypeEnum)).Cast<ClientTypeEnum>().ToList();

                var members = new PagedRequestResult<client_RolePlayer>();

                if (!string.IsNullOrEmpty(filter))
                {
                    members = await (from roleplayer in _rolePlayerRepository
                                     join company in _companyRepository on roleplayer.RolePlayerId equals company.RolePlayerId
                                     join finpayee in _finPayeeRepository on roleplayer.RolePlayerId equals finpayee.RolePlayerId
                                     where (
                                        (
                                             roleplayer.DisplayName.Contains(filter) ||
                                             roleplayer.Company.IdNumber.Contains(filter) ||
                                             roleplayer.Company.CompensationFundReferenceNumber.Contains(filter) ||
                                             roleplayer.Company.ReferenceNumber.Contains(filter) ||
                                             roleplayer.Company.VatRegistrationNo.Contains(filter) ||
                                             finpayee.FinPayeNumber.Contains(filter)
                                         )
                                         && industryClassFilters.Contains((IndustryClassEnum)company.IndustryClass)
                                         && clientTypeFilters.Contains((ClientTypeEnum)roleplayer.ClientType))
                                         && roleplayer.MemberStatus != MemberStatusEnum.New
                                     select roleplayer).ToPagedResult(pagedRequest);
                }
                else
                {
                    members = await (from roleplayer in _rolePlayerRepository
                                     join company in _companyRepository on roleplayer.RolePlayerId equals company.RolePlayerId
                                     join finpayee in _finPayeeRepository on roleplayer.RolePlayerId equals finpayee.RolePlayerId
                                     where (
                                        industryClassFilters.Contains((IndustryClassEnum)company.IndustryClass)
                                        && clientTypeFilters.Contains((ClientTypeEnum)roleplayer.ClientType))
                                        && roleplayer.MemberStatus != MemberStatusEnum.New
                                     select roleplayer).ToPagedResult(pagedRequest);
                }

                await _rolePlayerRepository.LoadAsync(members.Data, t => t.Company);
                await _rolePlayerRepository.LoadAsync(members.Data, t => t.FinPayee);
                var data = Mapper.Map<List<Roleplayer>>(members.Data);

                return new PagedRequestResult<Roleplayer>
                {
                    Data = data,
                    RowCount = members.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(members.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<string> GenerateMemberNumber(string memberName)
        {
            if (!string.IsNullOrWhiteSpace(memberName))
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.AccountNumber, memberName);
                }
            }
            return string.Empty;
        }
        public async Task<List<User>> SearchAccountExecutive(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return null;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                query = query.ToUpper();
                var users = await _userService.GetUsers();
                return users.Where(user => user.Name.ToUpper().Contains(query) ||
                    user.DisplayName.ToUpper().Contains(query) ||
                    user.Email.ToUpper().Contains(query)).ToList();
            }
        }

        public async Task<List<Company>> GetCompaniesByNameOrNumber(string searchCriteria)
        {
            List<Company> result = null;
            if (!string.IsNullOrWhiteSpace(searchCriteria))
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    result= await _rolePlayerService.GetCompaniesByNameOrNumber(searchCriteria);
                }
            }
            return result;
        }

        public async Task<List<NatureOfBusiness>> GetNatureOfBusiness()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var natureOfBusiness = await _natureOfBusinessService.GetNatureOfBusinesses();

                return Mapper.Map<List<NatureOfBusiness>>(natureOfBusiness);
            }
        }

        public async Task<CancelMemberSummary> MemberBulkCancel(FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var memberIndex = fileData.IndexOf("MemberNo", StringComparison.Ordinal);

            if (memberIndex != -1)
            {
                fileData = fileData.Substring(memberIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";
            int returned = 0;
            int _returned = 0;
            int uploadSkipped = 0;

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new MemberCancelMapping();
            var csvParser = new CsvParser<Load_MemberCancel>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var fileIdentifier = Guid.NewGuid();
            var memberNumber = string.Empty;
            var memberCancel = new List<Load_MemberCancel>();

            var rowNumber = 3; // First line containing data in the spreadsheet.
            var uploadResult = new CancelMemberSummary();

            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var message = $"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}";
                    throw new Exception(message);
                };
                if (string.IsNullOrEmpty(record.Result.MemberNo))
                {
                    uploadSkipped++;
                    continue;
                }
                var memberCancelData = record.Result;
                if (string.IsNullOrEmpty(memberNumber)) memberNumber = memberCancelData.MemberNo;
                memberCancelData.FileIdentifier = fileIdentifier;
                memberCancelData.MemberNo = memberNumber;
                memberCancelData.ExcelRowNumber = rowNumber.ToString();

                memberCancel.Add(memberCancelData);
                rowNumber++;
            }

            returned = memberCancel.Count;
            _returned = returned;
            //TODO - Actual cancel
            //var res = await BulkCancelMemberRecords(memberNumber, fileIdentifier, memberCancel, content.UserId);
            var res = 0;

            if (res > 0)
            {
                _returned = 0;
                var memberCancelFileAudit = new MemberCancelFileAudit();
                memberCancelFileAudit.FileName = content.FileName;
                memberCancelFileAudit.FileHash = Convert.ToString(fileIdentifier);
                memberCancelFileAudit.PremiumListingStatus = PremiumListingStatusEnum.Failed;
            }
            else
            {
                var memberCancelFileAudit = new MemberCancelFileAudit();
                memberCancelFileAudit.FileName = content.FileName;
                memberCancelFileAudit.FileHash = Convert.ToString(fileIdentifier);
                memberCancelFileAudit.PremiumListingStatus = PremiumListingStatusEnum.AwaitingApproval;
            }

            uploadResult.Total = rowNumber - 2;
            uploadResult.TotalCancelled = _returned;
            uploadResult.TotalSkipped = uploadSkipped;

            return uploadResult;

        }

        private async Task<int> CreateIndustryClassRenewal(IndustryClassRenewal industryClassRenewal)
        {
            Contract.Requires(industryClassRenewal != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_IndustryClassRenewal>(industryClassRenewal);
                _industryClassRenewalRepository.Create(entity);

                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task UpdateIndustryClassRenewal(IndustryClassRenewal industryClassRenewal)
        {
            Contract.Requires(industryClassRenewal != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_IndustryClassRenewal>(industryClassRenewal);
                _industryClassRenewalRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<IndustryClassRenewal>> GetIndustryClassRenewals()
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var industryClassRenewals = await _industryClassRenewalRepository.OrderBy(x => x.IndustryClass).ToListAsync();
                return Mapper.Map<List<IndustryClassRenewal>>(industryClassRenewals);
            }
        }

        public async Task ManageIndustryClassRenewals(List<IndustryClassRenewal> industryClassRenewals)
        {
            if (industryClassRenewals == null)
            {
                throw new NullReferenceException("Industry Class Renewals cannot be null");
            }

            foreach (var industryClassRenewal in industryClassRenewals)
            {
                if (industryClassRenewal.IndustryClassRenewalId == 0)
                {
                    await CreateIndustryClassRenewal(industryClassRenewal);
                }
                else
                {
                    await UpdateIndustryClassRenewal(industryClassRenewal);
                }
            }
        }

        public async Task SendRenewalLetters(List<IndustryClassEnum> industryClassEnums)
        {

            if (industryClassEnums == null)
            {
                throw new NullReferenceException("Industry Class cannot be null");
            }

            var emails = new List<string>();
            var phoneNos = new List<string>();
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var industryClassEnum in industryClassEnums)
                {
                    var companies = await _companyRepository.Where(s => s.IndustryClass == industryClassEnum).ToListAsync();

                    foreach (var company in companies)
                    {
                        var rolePlayer = await _rolePlayerService.GetRolePlayer(company.RolePlayerId);

                        foreach (var contact in rolePlayer.RolePlayerContacts)
                        {
                            var communicationType = contact.CommunicationType;

                            switch (contact.CommunicationType)
                            {
                                case CommunicationTypeEnum.Email:
                                    {
                                        emails.Add(contact.EmailAddress);
                                        if (!string.IsNullOrEmpty(contact.EmailAddress))
                                        {
                                            // await _leadCommunicationService.SendMemberRenewalLetters(contact.EmailAddress, rolePlayer);
                                        }
                                        break;
                                    }

                                case CommunicationTypeEnum.SMS:
                                    {
                                        phoneNos.Add(contact.ContactNumber);
                                        break;
                                    }

                                default:
                                    {
                                        emails.Add(contact.EmailAddress);
                                        break;
                                    }
                            }
                        }
                    }

                }
            }
        }

        public async Task<PagedRequestResult<EmailAudit>> GetPagedEmailAudit(PagedRequest request, string itemType, DateTime startDate)
        {
            return await _emailService.GetPagedEmailAudit(request, itemType, startDate);
        }

        public async Task ResendRenewalLetters(List<RolePlayerContact> rolePlayerContacts)
        {
            Contract.Requires(rolePlayerContacts != null);
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                foreach (var rolePlayerContact in rolePlayerContacts)
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(rolePlayerContact.RolePlayerId);
                    // await _leadCommunicationService.SendMemberRenewalLetters(rolePlayerContact.EmailAddress, rolePlayer);

                }
            }
        }

        public async Task<List<Roleplayer>> GetMembersByIndustryClass(IndustryClassEnum industryClass)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayers = await _rolePlayerRepository.Where(r => r.Company.IndustryClass == industryClass
                                                                        && (r.ClientType == ClientTypeEnum.Affinity || r.ClientType == ClientTypeEnum.Company)).ToListAsync();

                await _rolePlayerRepository.LoadAsync(rolePlayers, a => a.Company);
                await _rolePlayerRepository.LoadAsync(rolePlayers, a => a.RolePlayerContacts);
                await _rolePlayerRepository.LoadAsync(rolePlayers, a => a.FinPayee);

                foreach (var rolePlayer in rolePlayers)
                {
                    await _rolePlayerContactRepository.LoadAsync(rolePlayer.RolePlayerContacts, rp => rp.RolePlayerContactInformations);
                }

                return Mapper.Map<List<Roleplayer>>(rolePlayers.Where(a => a.Company != null));
            }
        }

        public async Task RemoveContactInformation(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _rolePlayerContactInformationRepository.Delete(d => d.RolePlayerContactInformationId == id);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }        

        public async Task<PagedRequestResult<Company>> GetPagedCompanies(int companyLevelId, int rolePlayerId, PagedRequest pagedRequest)
        {
            if (pagedRequest == null) throw new ArgumentNullException(nameof(pagedRequest));

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = pagedRequest.SearchCriteria;
                IQueryable<client_Company> query = _companyRepository;

                if (!string.IsNullOrEmpty(filter))
                {
                    query = query.Where(c =>
                        c.Name.Contains(filter) ||
                        c.RolePlayer.FinPayee.FinPayeNumber.Contains(filter) ||
                        c.ReferenceNumber.Contains(filter) ||
                        c.CompensationFundReferenceNumber.Contains(filter) ||
                        c.VatRegistrationNo.Contains(filter));
                }

                if (rolePlayerId != -1)
                {
                    query = query.Where(c => c.LinkedCompanyId == rolePlayerId);
                }

                if (companyLevelId != -1)
                {
                    query = query.Where(c => c.CompanyLevel == (CompanyLevelEnum)companyLevelId);
                }

                query.Where(c => c.RolePlayer.MemberStatus != MemberStatusEnum.New);

                var companies = await query.ToPagedResult<client_Company, Company>(pagedRequest);

                return new PagedRequestResult<Company>
                {
                    Data = companies.Data,
                    RowCount = companies.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(companies.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<Person>> GetPagedPersons(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);    
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchTerm = pagedRequest.SearchCriteria;
                Contract.Requires(pagedRequest != null);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var filter = pagedRequest.SearchCriteria;
                    var persons = await _personRepository
                        .Where(c => c.FirstName.Contains(filter)
                                     || c.Surname.Contains(filter) || c.IdNumber.Contains(filter) || c.DeathCertificateNumber.Contains(filter))
                        .ToPagedResult<client_Person, Person>(pagedRequest);
                    return new PagedRequestResult<Person>
                    {
                        Data = persons.Data,
                        RowCount = persons.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(persons.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            }
        }

        public async Task<List<LinkedUserMember>> GetLinkedUserMembers(int userId)
        {
            var linkedUserMembers = new List<LinkedUserMember>();
            if (userId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var userCompanyMaps = await _userService.GetUserCompanyMaps(userId);

                    foreach (var userCompanyMap in userCompanyMaps)
                    {
                        var company = await _companyRepository.FirstOrDefaultAsync(s => s.RolePlayerId == userCompanyMap.CompanyId);
                        var finPayee = await _finPayeeRepository.FirstOrDefaultAsync(s => s.RolePlayerId == userCompanyMap.CompanyId);

                        if (company != null && finPayee != null)
                        {
                            var linkedUserMember = new LinkedUserMember
                            {
                                RolePlayerId = company.RolePlayerId,
                                MemberName = company.Name,
                                FinPayeNumber = finPayee.FinPayeNumber,
                                UserCompanyMapStatus = userCompanyMap.UserCompanyMapStatus,
                                RoleId = userCompanyMap.RoleId
                            };

                            linkedUserMembers.Add(linkedUserMember);
                        }
                    }
                   
                }
            }
            return linkedUserMembers;
        }

        public async Task<PagedRequestResult<LinkedUserMember>> GetPagedLinkedUserMembers(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("PageNumber", pagedRequest.Page),
                    new SqlParameter("RowsOfPage", pagedRequest.PageSize),
                    new SqlParameter("SortingCol", pagedRequest.OrderBy),
                    new SqlParameter("SortType", pagedRequest.IsAscending ? "ASC" : "DESC"),
                    new SqlParameter("SearchCreatia", pagedRequest.SearchCriteria == null ? string.Empty : pagedRequest.SearchCriteria),
                    new SqlParameter("RecordCount", SqlDbType.Int)
                };

                parameters[5].Direction = ParameterDirection.Output;
                var searchResult = await _rolePlayerRepository.SqlQueryAsync<LinkedUserMember>(RMA.Service.ClientCare.Database.Constants.DatabaseConstants.GetPagedLinkedUserMember, parameters);
                var recordCount = (int)parameters[5]?.Value;

                return new PagedRequestResult<LinkedUserMember>()
                {
                    Page = pagedRequest.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = pagedRequest.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<Company> GetMemberCompanyByRegistrationNumber(string registrationNumber)
        {
            Company result= null;
            if (!string.IsNullOrEmpty(registrationNumber))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var company = await _companyRepository.FirstOrDefaultAsync(s => s.IdNumber.Trim().ToLower() == registrationNumber.Trim().ToLower());
                    result= Mapper.Map<Company>(company);
                }
            }
            return result;
        }

        public async Task<Company> GetMemberCompanyByCFReferenceNumber(string cfReferenceNumber)
        {
            Company result = null;
            if (!string.IsNullOrEmpty(cfReferenceNumber))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var company = await _companyRepository.FirstOrDefaultAsync(s => s.CompensationFundReferenceNumber.Trim().ToLower() == cfReferenceNumber.Trim().ToLower());
                    result= Mapper.Map<Company>(company);
                }
            }
            return result;
        }

        public async Task<Company> GetMemberCompanyByCFRegistrationNumber(string cfRegistrationNumber)
        {
            Company result = null;
            if (!string.IsNullOrEmpty(cfRegistrationNumber))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var company = await _companyRepository.FirstOrDefaultAsync(s => s.ReferenceNumber.Trim().ToLower() == cfRegistrationNumber.Trim().ToLower());
                    result = Mapper.Map<Company>(company);
                }
            }
            return result;
        }

        public async Task<PagedRequestResult<PersonEmployment>> GetPagedEmployees(EmployeeSearchRequest employeeSearchRequest)
        {
            Contract.Requires(employeeSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _personEmploymentRepository.AsQueryable();

                if (employeeSearchRequest.EmployerRolePlayerId.HasValue)
                {
                    var employerRolePlayerId = employeeSearchRequest.EmployerRolePlayerId.Value;
                    query = query.Where(r => r.EmployerRolePlayerId == employerRolePlayerId);
                }

                if (!string.IsNullOrEmpty(employeeSearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = employeeSearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.EmployeeNumber.Contains(filter) || r.Person.FirstName.Contains(filter) || r.Person.Surname.Contains(filter) || r.Person.IdNumber.Contains(filter));
                }

                var employees = await query.ToPagedResult(employeeSearchRequest.PagedRequest);

                var data = Mapper.Map<List<PersonEmployment>>(employees.Data);

                return new PagedRequestResult<PersonEmployment>
                {
                    Page = employeeSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(employees.RowCount / (double)employeeSearchRequest.PagedRequest.PageSize),
                    RowCount = employees.RowCount,
                    PageSize = employeeSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }
    }
}

