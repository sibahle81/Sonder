using AutoMapper;
using AutoMapper.QueryableExtensions;
using CommonServiceLocator;
using Newtonsoft.Json;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Enums;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

using DatabaseConstants = RMA.Service.Admin.BusinessProcessManager.Database.Constants.DatabaseConstants;
using INoteService = RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces.INoteService;
using QueryableExtensions = System.Data.Entity.QueryableExtensions;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class WizardFacade : RemotingStatelessService, IWizardService
    {
        private readonly IWizardHost _wizardHost;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly INoteService _noteService;
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        private readonly IWizardConfigurationService _wizardConfigurationService;
        private readonly IRepository<bpm_Note> _noteRepository;
        private readonly IRepository<bpm_Wizard> _wizardRepository;
        private readonly IRepository<bpm_LastViewed> _lastViewedRepository;
        private readonly IRepository<bpm_WizardConfiguration> _wizardConfigurationRepository;
        private readonly ISerializerService _serializer;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<bpm_WizardApprovalStage> _wizardApprovalStageRepository;
        private readonly IRepository<bpm_WizardPermission> _wizardPermissionRepository;
        private readonly IRepository<bpm_WizardPermissionOverride> _wizardPermissionOverrideRepository;
        private readonly IMapper _mapper;

        private const string lockedUserPlaceHolder = "{lockeduser}";
        private const string fflStartWizardPermissionCheck = "StartWizardPermissionCheck";
        private const int _initiatePensionCaseWizardConfigurationId = 90;

        public WizardFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<bpm_Note> noteRepository,
            IRepository<bpm_Wizard> wizardRepository,
            IRepository<bpm_LastViewed> lastViewedRepository,
            IRepository<bpm_WizardConfiguration> wizardConfigurationRepository,
            IWizardConfigurationService wizardConfigurationService,
            IRoleService roleService,
            IUserService userService,
            INoteService noteService,
            IWizardHost wizardHost,
            ISerializerService serializer,
            IConfigurationService configurationService,
            IRepository<bpm_WizardApprovalStage> wizardApprovalStageRepository,
            IRepository<bpm_WizardPermission> wizardPermissionRepository,
            IRepository<bpm_WizardPermissionOverride> wizardPermissionOverrideRepository,
            IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _wizardConfigurationService = wizardConfigurationService;
            _wizardApprovalStageRepository = wizardApprovalStageRepository;
            _wizardPermissionOverrideRepository = wizardPermissionOverrideRepository;

            _noteRepository = noteRepository;
            _wizardRepository = wizardRepository;
            _lastViewedRepository = lastViewedRepository;
            _wizardConfigurationRepository = wizardConfigurationRepository;
            _wizardPermissionRepository = wizardPermissionRepository;

            _wizardHost = wizardHost;
            _userService = userService;
            _noteService = noteService;
            _roleService = roleService;
            _serializer = serializer;
            _configurationService = configurationService;
            _mapper = mapper;
        }

        public async Task<Wizard> GetWizard(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizard = await _wizardRepository.SingleAsync(s => s.Id == id, $"Could not find wizard with the id {id}");
                var result = _mapper.Map<Wizard>(wizard);
                //Prevent JSON validation errors on existing wizards
                result.Data = result.Data.Replace(":\"\"", ":[X]");
                result.Data = result.Data.Replace("\"\"", "");
                result.Data = result.Data.Replace("[X]", "\"\"");
                SetWizardStatus(result);
                return (await ProcessWizard(new List<Wizard>() { result }))[0];
            }
        }

        public async Task<int> GetLastWizard()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizard = await _wizardRepository.Where(x => x.Id > 0).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
                return wizard.Id;
            }
        }

        public async Task UpdateWizard(Wizard wizard)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataWizard = await this._wizardRepository.Where(x => x.Id == wizard.Id).SingleAsync();
                dataWizard.LinkedItemId = wizard?.LinkedItemId;

                if (wizard != null)
                {
                    dataWizard.Data = wizard.Data;
                    dataWizard.CustomRoutingRoleId = wizard.CustomRoutingRoleId;
                    dataWizard.LockedToUser = wizard.LockedToUser;
                    dataWizard.CustomStatus = wizard.CustomStatus;
                    dataWizard.WizardStatus = wizard.WizardStatus;
                }

                this._wizardRepository.Update(dataWizard);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<Wizard> GetWizardOnly(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizard = await this._wizardRepository.Include(r => r.WizardConfiguration)
                                 .SingleAsync(s => s.Id == id, $"Could not find wizard with the id {id}");
                var result = _mapper.Map<Wizard>(wizard);

                return result;
            }
        }

        public async Task<Wizard> GetWizardNameOnly(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizard = await this._wizardRepository.Where(s => s.Id == id)
                                 .Select(a => new Wizard()
                                 {
                                     Name = a.Name,
                                     WizardStatus = a.WizardStatus
                                 }).FirstOrDefaultAsync();

                var result = _mapper.Map<Wizard>(wizard);
                return result;
            }
        }

        /// <summary>
        /// Checks if the wizard is completed based on the Id of the wizard table.
        /// </summary>
        /// <param name="id">WizardId</param>
        /// <returns></returns>
        public async Task<bool> IsWizardCompleted(int? id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _wizardRepository.AnyAsync(s => s.Id == id && s.WizardStatus == WizardStatusEnum.Completed);
            }
        }

        public async Task<List<Wizard>> GetWizardsByType(string type)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository
                    .Where(wizard => wizard.WizardConfiguration.Name == type)
                    .OrderByDescending(e => e.Id)
                    .ToListAsync();

                var mappedWizards = _mapper.Map<List<Wizard>>(wizards);
                var result = await this.ProcessWizard(mappedWizards, true, true);
                return result;
            }
        }

        public async Task<Wizard> GetWizardLastWizardByType(string type)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var wizard = await this._wizardRepository
                    .Where(w => w.WizardConfiguration != null && w.WizardConfiguration.Name == type)
                    .OrderByDescending(e => e.Id)
                    .FirstOrDefaultAsync();

                if (wizard != null)
                {
                    var modelWizard = _mapper.Map<Wizard>(wizard);
                    var result = (await this.ProcessWizard(
                                      new List<Wizard>()
                                          {
                                              modelWizard
                                          },
                                      true,
                                      true))[0];
                    return result;
                }

                var setWizard = new Wizard { WizardStatus = WizardStatusEnum.InProgress };
                return setWizard;
            }
        }

        public async Task<Wizard> GetWizardByLinkedItemId(int linkedItemId)
        {
            //WizardConfigNotificationEnum
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int[] notificationsArray = Array.ConvertAll((int[])Enum.GetValues(typeof(WizardConfigNotificationEnum)), Convert.ToInt32);

                var wizard = await _wizardRepository.ProjectTo<Wizard>(_mapper.ConfigurationProvider)
                    .Where(w => w.LinkedItemId == linkedItemId
                             && w.WizardStatus != WizardStatusEnum.Completed
                             && w.WizardStatus != WizardStatusEnum.Cancelled
                             && w.WizardStatus != WizardStatusEnum.Rejected
                             && !notificationsArray.Contains(w.WizardConfigurationId))
                    .FirstOrDefaultAsync();
                return wizard;
            }
        }

        public async Task<Wizard> GetWizardByLinkedItemAndConfigId(int linkedItemId, int wizardConfigId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _wizardRepository.Where(w =>
                                 w.LinkedItemId == linkedItemId && w.WizardConfigurationId == wizardConfigId).SingleOrDefaultAsync();

                return _mapper.Map<Wizard>(entity);
            }
        }

        public async Task<List<Wizard>> GetUserWizardsByWizardConfigs(List<int> wizardConfigationIds, bool canReAssignTask)
        {
            Contract.Requires(wizardConfigationIds != null);
            if (wizardConfigationIds.Count == 0) return new List<Wizard>();

            var username = RmaIdentity.Username;
            var roleId = RmaIdentity.RoleId;

            var wizards = await GetAllWizardsForUser(wizardConfigationIds, canReAssignTask);
            var usernames = await GetUserNames(wizards);
            var roles = await GetCustomRoles(wizards);

            var wizardList = new List<Wizard>();
            // for loop is faster than foreach with lists (Google it if you don't believe me)
            var count = wizards.Count;
            for (int i = 0; i < count; i++)
            {
                var wizard = _mapper.Map<Wizard>(wizards[i]);

                wizard.Data = null;
                wizard.StartType = "Continue";
                wizard.CurrentStep = $"Step {wizard.CurrentStepIndex}";
                wizard.Type = wizard.WizardConfiguration.Name;

                wizard.CanEdit = HasEditPermission(username, wizard, HasPermission(wizard.WizardConfiguration.ContinuePermissions));
                wizard.CanApprove = HasApprovePermission(username, roleId, wizard, HasPermission(wizard.WizardConfiguration.ApprovalPermissions));
                wizard.WizardStatusText = GetWizardStatusText(wizard);
                wizard.CustomRoutingRole = GetCustomRoutingRole(wizard, roles);

                wizard.LockedToUserDisplayName = GetUserName(usernames, username, wizard.LockedToUser);
                wizard.CreatedByDisplayName = GetUserName(usernames, username, wizard.CreatedBy);
                wizard.ModifiedByDisplayName = GetUserName(usernames, username, wizard.ModifiedBy);

                wizard.CantApproveReason = GetReason(wizard.CantApproveReason, usernames, username, wizard.LockedToUser);
                wizard.LockedReason = GetReason(wizard.LockedReason, usernames, username, wizard.LockedToUser);

                wizardList.Add(wizard);
            }

            return wizardList;
        }


        private async Task<List<bpm_Wizard>> GetAllWizardsForUser(List<int> wizardConfigurationIds, bool canReassignTask)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var allWizards = await _wizardRepository.SqlQueryAsync<bpm_Wizard>(
                              DatabaseConstants.GetUserWizards,
                              new SqlParameter("@UserId", RmaIdentity.UserId),
                              new SqlParameter("@wizardConfigurations", GetWizardConfigurationXml(wizardConfigurationIds)));

                var wizards = new List<bpm_Wizard>();

                if (allWizards.Count > 0)
                {
                    // Load wizard configurations
                    var wizardConfigurations = await GetWizardConfigurations(allWizards);

                    // Filter on user and wizard status
                    if (!canReassignTask)
                    {
                        // Get all the wizards locked to the current user.
                        wizards.AddRange(allWizards.Where(w => w.LockedToUser == RmaIdentity.Username));
                        LoadWizardConfigurations(wizards, wizardConfigurations);

                        // Get all the unlocked wizards
                        var notLockedToUser = allWizards.Where(w => w.LockedToUser == null);
                        LoadWizardConfigurations(notLockedToUser, wizardConfigurations);

                        // Apply the filters to the unlocked wizards
                        wizards.AddRange(notLockedToUser
                            .Where(w => (w.CreatedBy == RmaIdentity.Username)
                                     || (w.WizardStatus == WizardStatusEnum.AwaitingApproval)
                                     || (w.WizardStatus == WizardStatusEnum.InProgress)));
                    }
                    else
                    {
                        // Load all the wizards
                        wizards.AddRange(allWizards);
                        LoadWizardConfigurations(wizards, wizardConfigurations);
                    }
                }
                return wizards.ToList();
            }
        }

        public async Task<PagedRequestResult<Wizard>> GetUserWizardsByWizardConfigsPaged(PagedRequest request, List<int> wizardConfigationIds, string wizardStatus, string lockStatus, string orderOverride)
        {
            Contract.Requires(request != null);
            Contract.Requires(wizardConfigationIds != null);

            if (wizardConfigationIds.Count == 0) return new PagedRequestResult<Wizard>();
            var username = RmaIdentity.Username;
            var roleId = RmaIdentity.RoleId;
            var wizards = await GetAllWizardsForUserPaged(request, username, wizardConfigationIds, wizardStatus, lockStatus, orderOverride);
            var usernames = await GetUserNames(wizards.Data);
            var roles = await GetCustomRoles(wizards.Data);
            var wizardList = new List<Wizard>();
            // for loop is faster than foreach with lists (Google it if you don't believe me)
            var count = wizards.Data.Count;
            for (int i = 0; i < count; i++)
            {
                var wizard = _mapper.Map<Wizard>(wizards.Data[i]);
                wizard.Data = null;
                wizard.StartType = "Continue";
                wizard.CurrentStep = $"Step {wizard.CurrentStepIndex}";
                wizard.Type = wizard.WizardConfiguration.Name;
                wizard.CanEdit = HasEditPermission(username, wizard, HasPermission(wizard.WizardConfiguration.ContinuePermissions));
                wizard.CanApprove = HasApprovePermission(username, roleId, wizard, HasPermission(wizard.WizardConfiguration.ApprovalPermissions));
                wizard.WizardStatusText = GetWizardStatusText(wizard);
                wizard.CustomRoutingRole = GetCustomRoutingRole(wizard, roles);
                wizard.LockedToUserDisplayName = GetUserName(usernames, username, wizard.LockedToUser);
                wizard.CreatedByDisplayName = GetUserName(usernames, username, wizard.CreatedBy);
                wizard.ModifiedByDisplayName = GetUserName(usernames, username, wizard.ModifiedBy);
                wizard.CantApproveReason = GetReason(wizard.CantApproveReason, usernames, username, wizard.LockedToUser);
                wizard.LockedReason = GetReason(wizard.LockedReason, usernames, username, wizard.LockedToUser);
                wizardList.Add(wizard);
            }
            return new PagedRequestResult<Wizard>()
            {
                Page = wizards.Page,
                PageCount = wizards.PageCount,
                RowCount = wizards.RowCount,
                PageSize = wizards.PageSize,
                Data = wizardList
            };
        }
        private async Task<PagedRequestResult<bpm_Wizard>> GetAllWizardsForUserPaged(PagedRequest request, string username, List<int> wizardConfigurationIds, string wizardStatus, string lockStatus, string orderOverride)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                        new SqlParameter("userId", RmaIdentity.UserId),
                        new SqlParameter("wizardConfigurations", GetWizardConfigurationXml(wizardConfigurationIds)),
                        new SqlParameter("PageNumber", request.Page),
                        new SqlParameter("RowsOfPage", request.PageSize),
                        new SqlParameter("SortingCol", request.OrderBy),
                        new SqlParameter("SortType", request.IsAscending ? "ASC" : "DESC"),
                        new SqlParameter("SearchCreatia", request.SearchCriteria == null? string.Empty : request.SearchCriteria),
                        new SqlParameter("WizardStatus", wizardStatus),
                        new SqlParameter("LockedStatus", lockStatus),
                        new SqlParameter("OrderOverride", orderOverride),
                        new SqlParameter("RecordCount", SqlDbType.Int),
                    };
                parameters[10].Direction = ParameterDirection.Output;
                var searchResult = await _wizardRepository.SqlQueryAsync<bpm_Wizard>(
                    "[bpm].[GetUserWizards2] @userId, @wizardConfigurations, @PageNumber, @RowsOfPage, @SortingCol, @SortType, @SearchCreatia, @WizardStatus, @LockedStatus, @OrderOverride, @RecordCount Out", parameters);
                var recordCount = (int)parameters[10].Value;
                var wizards = new List<bpm_Wizard>();
                if (searchResult.Count > 0)
                {
                   var wizardIds = searchResult.Select(w => w.Id).ToList();

                    var overrides = await _wizardPermissionOverrideRepository
                        .Where(o => wizardIds.Contains(o.WizardId))
                        .ToListAsync();

                    foreach (var wizard in searchResult)
                    {
                        wizard.WizardPermissionOverrides = overrides.Where(o => o.WizardId == wizard.Id).ToList();
                    }

                    // Load wizard configurations
                    var wizardConfigurations = await GetWizardConfigurations(searchResult);
                    // Get all the wizards locked to the current user.
                    wizards.AddRange(searchResult.Where(w => w.LockedToUser == username));
                    LoadWizardConfigurations(searchResult, wizardConfigurations);
                    // Get all the unlocked wizards
                    var notLockedToUser = searchResult.Where(w => w.LockedToUser == null);
                    LoadWizardConfigurations(notLockedToUser, wizardConfigurations);
                    // Apply the filters to the unlocked wizards
                    wizards.AddRange(notLockedToUser
                        .Where(w => (w.CreatedBy == username)
                                 || (w.WizardStatus == WizardStatusEnum.AwaitingApproval)
                                 || (w.WizardStatus == WizardStatusEnum.InProgress)));
                }
                return new PagedRequestResult<bpm_Wizard>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        private string GetWizardConfigurationXml(List<int> wizardConfigurationIds)
        {
            var values = $"<Id>{string.Join("</Id><Id>", wizardConfigurationIds)}</Id>";
            var xml = $"<WizardConfiguration>{values}</WizardConfiguration>";
            return xml;
        }

        private void LoadWizardConfigurations(IEnumerable<bpm_Wizard> list, IEnumerable<bpm_WizardConfiguration> wizardConfigurations)
        {
            var count = list.Count();
            for (int i = 0; i < count; i++)
            {
                var wizard = list.ElementAt(i);
                wizard.WizardConfiguration = wizardConfigurations.SingleOrDefault(c => c.Id == wizard.WizardConfigurationId);
            }
        }

        private async Task<IEnumerable<bpm_WizardConfiguration>> GetWizardConfigurations(List<bpm_Wizard> allWizards)
        {
            using (_dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
            {
                var configurationIds = allWizards
                    .Select(w => w.WizardConfigurationId)
                    .Distinct()
                    .ToList();
                var configurations = await _wizardConfigurationRepository
                    .Where(wc => configurationIds.Contains(wc.Id))
                    .ToListAsync();
                await _wizardConfigurationRepository.LoadAsync(configurations, w => w.WizardPermissions);
                return configurations;
            }
        }

        private string GetCustomRoutingRole(Wizard wizard, List<Role> roles)
        {
            if (!wizard.CustomRoutingRoleId.HasValue) return "";
            if (wizard.CustomRoutingRoleId == 0) return "";
            var role = roles.SingleOrDefault(r => r.Id == wizard.CustomRoutingRoleId.Value);
            if (role == null) return "";
            return role.Name;
        }

        private string GetReason(string reason, Dictionary<string, string> usernames, string username, string lockedToUser)
        {
            if (reason is null) return string.Empty;
            if (reason.IndexOf(lockedUserPlaceHolder, StringComparison.OrdinalIgnoreCase) < 0) return reason;
            var user = GetUserName(usernames, username, lockedToUser);
            return reason.Replace(lockedUserPlaceHolder, user);
        }

        private string GetUserName(Dictionary<string, string> usernames, string username, string email)
        {
            if (string.IsNullOrEmpty(email)) return string.Empty;
            return username.Equals(email, StringComparison.OrdinalIgnoreCase) ? "You" : GetDisplayName(usernames, email);
        }

        private string GetDisplayName(Dictionary<string, string> usernames, string email)
        {
            var user = usernames.Where(d => d.Key == email).Select(v => v.Value).SingleOrDefault();
            return user ?? email;
        }

        private async Task<Dictionary<string, string>> GetUserNames(List<bpm_Wizard> wizards)
        {
            var userNames = (wizards.Select(d => d.LockedToUser)
                                    .Concat(wizards.Select(d => d.ModifiedBy))
                                    .Concat(wizards.Select(d => d.CreatedBy)))
                            .Where(u => u != null)
                            .Distinct()
                            .ToList();
            return await _userService.GetUserDisplayNamesFromEmail(userNames);
        }

        private async Task<List<Role>> GetCustomRoles(List<bpm_Wizard> wizards)
        {
            var roleIds = wizards
                .Where(r => r.CustomRoutingRoleId.HasValue && r.CustomRoutingRoleId.Value > 0)
                .Select(r => r.CustomRoutingRoleId.Value)
                .Distinct()
                .ToList();
            return await _roleService.GetRolesById(roleIds);
        }

        private string GetWizardStatusText(Wizard wizard)
        {
            if (!string.IsNullOrEmpty(wizard.CustomStatus) && wizard.WizardStatus == WizardStatusEnum.InProgress)
            {
                return $"{WizardStatusEnum.InProgress.DisplayAttributeValue()} - {wizard.CustomStatus}";
            }
            return wizard.WizardStatus.DisplayAttributeValue();
        }

        private bool HasEditPermission(string username, Wizard wizard, bool hasPermission)
        {
            if (!hasPermission)
            {
                wizard.LockedReason = "You do not have sufficient permissions to edit this wizard.";
                return false;
            }

            if (LockedToAnotherUser(username, wizard))
            {
                wizard.LockedReason = $"This wizard is in read-only mode because it's locked to {lockedUserPlaceHolder}.";
                return false;
            }

            switch (wizard.WizardStatus)
            {
                case WizardStatusEnum.Cancelled:
                case WizardStatusEnum.Completed:
                case WizardStatusEnum.Rejected:
                    wizard.LockedReason = $"This wizard is in read-only mode because it's {wizard.WizardStatus.DisplayAttributeValue()}.";
                    return false;
                case WizardStatusEnum.AwaitingApproval:
                    if (!wizard.WizardConfiguration.AllowEditOnApproval)
                    {
                        wizard.LockedReason = $"This wizard is in read-only mode because it's {wizard.WizardStatus.DisplayAttributeValue()}.";
                        return false;
                    }
                    break;
            }

            return true;
        }

        private bool HasApprovePermission(string username, int roleId, Wizard wizard, bool hasPermission)
        {
            if (wizard.WizardConfiguration?.ApprovalPermissions.Count == 0)
            {
                wizard.CantApproveReason = "This wizard does not have approval";
                return false;
            }

            wizard.HasApproval = true;

            if (wizard.WizardStatus != WizardStatusEnum.AwaitingApproval)
            {
                wizard.CantApproveReason = $"This wizard cannot be approved/rejected because it's status is: {wizard.WizardStatus.DisplayAttributeValue()}.";
                return false;
            }

            if (!hasPermission)
            {
                wizard.CantApproveReason = "You do not have sufficient permissions to approve/reject this wizard";
                return false;
            }

            if (wizard.CustomRoutingRoleId.HasValue && wizard.CustomRoutingRoleId.Value != roleId)
            {
                wizard.CantApproveReason = "You do not have sufficient permissions to approve/reject this wizard";
                return false;
            }

            if (LockedToAnotherUser(username, wizard))
            {
                wizard.CantApproveReason = $"You cannot approve/reject this wizard because it's locked to {lockedUserPlaceHolder}.";
                return false;
            }

            // Check the last user who modified the wizard, because the person who created it
            // is not necessarily the same one who created the wizard, especially when
            // the wizard was created by an automated process
            if (username.Equals(wizard.ModifiedBy, StringComparison.OrdinalIgnoreCase))
            {
                wizard.CantApproveReason = "You cannot request and approve/reject the same wizard.";
                return false;
            }

            return true;
        }

        private bool HasPermission(List<string> permissions)
        {
            // User has permission if no permissions are required or the user
            // has the required permission explicitly assigned.
            return permissions.Count == 0 || RmaIdentity.HasClaim(permissions.ToArray());
        }

        private bool LockedToAnotherUser(string username, Wizard wizard)
        {
            if (string.IsNullOrEmpty(wizard.LockedToUser)) return false;
            return !username.Equals(wizard.LockedToUser);
        }

        // Don't remove the old method yet, we still have to test the new one with a large 
        // number of records.
        /*
        public async Task<List<Wizard>> old_GetUserWizardsByWizardConfigs(List<int> wizardConfigIds, bool canReAssignTask)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var roleId = RmaIdentity.RoleId;
                var username = RmaIdentity.Username;

                var allWizards = await QueryableExtensions.AsNoTracking(this._wizardRepository
                        .Where(wizard => wizardConfigIds.Contains(wizard.WizardConfigurationId))
                        .Where(FilterUserWizards(username, roleId, canReAssignTask)))
                    .AsQueryable()
                    .ToListAsync();

                var wizards = _mapper.Map<List<Wizard>>(allWizards);
                var result = await this.ProcessWizard(
                                 wizards,
                                 false,
                                 true,
                                 true,
                                 username,
                                 roleId,
                                 canReAssignTask);

                foreach (var wizard in result)
                {
                    const int interBankTransferWizardConfigId = 11;
                    if (wizard.WizardConfigurationId == interBankTransferWizardConfigId)
                    {
                        var entity = await _wizardRepository.Where(w => w.Id == wizard.Id).SingleAsync();
                        var stepData = _serializer.Deserialize<ArrayList>(entity.Data);
                        var interBankTransfer = _serializer.Deserialize<InterBankTransfer>(stepData[0].ToString());
                        if (interBankTransfer.InterDebtorTransfer != null)
                        {
                            wizard.Type = "inter-debtor-transfer";
                        }
                        else if (interBankTransfer.IsInitiatedByClaimPayment)
                        {
                            wizard.Type = "claims-interbank-transfer";
                        }
                    }
                }

                return result;
            }
        }
        */

        public async Task<List<Wizard>> GetUserWizards()
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var roleId = RmaIdentity.RoleId;
                var username = RmaIdentity.Username;

                var allWizards = await QueryableExtensions
                                       .AsNoTracking(this._wizardRepository.Where(FilterUserWizards(username, roleId)))
                                       .AsQueryable()
                                       .ToListAsync();

                var wizards = _mapper.Map<List<Wizard>>(allWizards);
                var result = await this.ProcessWizard(
                                          wizards,
                                           true,
                                           true,
                                          true,
                                          username,
                                          roleId);
                return result;
            }
        }

        public async Task<PagedRequestResult<Wizard>> SearchWizards(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository
                    .Where(w => w.IsActive
                            && (w.Name.Contains(request.SearchCriteria)
                             || w.LockedToUser.Contains(request.SearchCriteria)
                             || w.CreatedBy.Contains(request.SearchCriteria)
                             || w.ModifiedBy.Contains(request.SearchCriteria)
                            )
                    )
                    .Select(n => new
                    {
                        wizard = n,
                        wizardConfiguration = n.WizardConfiguration,
                        // Front-end sort fields
                        name = n.Name,
                        type = n.WizardConfiguration.Name,
                        createdBy = n.CreatedBy,
                        lockedToUser = n.LockedToUser,
                        wizardStatusText = n.WizardStatus.ToString(),
                        overAllSLAHours = System.Data.Entity.DbFunctions.DiffSeconds(n.CreatedDate, DateTimeHelper.SaNow)
                    })
                    .ToPagedResult(request);

                if (wizards.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<Wizard>
                    {
                        Page = wizards.Page,
                        PageCount = wizards.PageCount,
                        RowCount = wizards.RowCount,
                        PageSize = wizards.PageSize,
                        Data = new List<Wizard>()
                    };

                    var mappedWizard = _mapper.Map<List<Wizard>>(wizards.Data.Select(t => t.wizard));
                    foreach (var wizUpdate in mappedWizard)
                    {
                        // Do not include the data, this will be included when loading the wizard
                        wizUpdate.Data = null;
                        SetWizardStatus(wizUpdate);
                        returnResult.Data.Add(wizUpdate);
                    }

                    return returnResult;
                }

                return new PagedRequestResult<Wizard>();
            }
        }

        public async Task<PagedRequestResult<Wizard>> SearchUserNewWizardsByWizardType(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var username = RmaIdentity.Username;
                var wizards = await _wizardRepository
                    .Where(w => w.IsActive && !w.IsDeleted && (string.IsNullOrEmpty(request.SearchCriteria) || w.Name.Contains(request.SearchCriteria)) && w.CreatedBy == username && w.WizardStatus == WizardStatusEnum.InProgress)
                    .Select(n => new
                    {
                        wizard = n,
                        wizardConfiguration = n.WizardConfiguration,
                        // Front-end sort fields
                        name = n.Name,
                        type = n.WizardConfiguration.Name,
                        createdBy = n.CreatedBy,
                        lockedToUser = n.LockedToUser,
                        wizardStatusText = n.WizardStatus.ToString(),
                        overAllSLAHours = System.Data.Entity.DbFunctions.DiffSeconds(n.CreatedDate, DateTimeHelper.SaNow)
                    })
                    .ToPagedResult(request);

                if (wizards.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<Wizard>
                    {
                        Page = wizards.Page,
                        PageCount = wizards.PageCount,
                        RowCount = wizards.RowCount,
                        PageSize = wizards.PageSize,
                        Data = new List<Wizard>()
                    };

                    var mappedWizard = _mapper.Map<List<Wizard>>(wizards.Data.Select(t => t.wizard));
                    foreach (var wizUpdate in mappedWizard)
                    {
                        SetWizardStatus(wizUpdate);
                        returnResult.Data.Add(wizUpdate);
                    }

                    return returnResult;
                }

                return new PagedRequestResult<Wizard>();
            }
        }

        public async Task<PagedRequestResult<Wizard>> SearchUserNewWizardsByWizardCapturedData(PagedRequest request)
        {
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var username = RmaIdentity.Username;
                var wizardFilterSearch = JsonConvert.DeserializeObject<PreAuthWizardFilterSearch>(request.SearchCriteria);
                string ContainsText = (!string.IsNullOrEmpty(wizardFilterSearch.ContainsText)) ? wizardFilterSearch.ContainsText : "";
                string ContainsDate = (!string.IsNullOrEmpty(wizardFilterSearch.ContainsDate)) ? wizardFilterSearch.ContainsDate : "";
                string healthCareProviderName = (!string.IsNullOrEmpty(wizardFilterSearch.HealthCareProviderName)) ? wizardFilterSearch.HealthCareProviderName : "";
                string temporaryReferenceNo = (!string.IsNullOrEmpty(wizardFilterSearch.TemporaryReferenceNo)) ? wizardFilterSearch.TemporaryReferenceNo : "";

                var wizards =
                     await (
                            from sb in _wizardRepository
                            where (sb.IsActive && !sb.IsDeleted && sb.CreatedBy == username &&
                            sb.WizardStatus == WizardStatusEnum.InProgress &&
                            sb.Data.Contains(ContainsText) && sb.Data.Contains(ContainsDate) &&
                            sb.Data.Contains(healthCareProviderName) && sb.Data.Contains(temporaryReferenceNo)
                            )
                            select new
                            {
                                wizard = sb,
                                wizardConfiguration = sb.WizardConfiguration,
                                // Front-end sort fields
                                name = sb.Name,
                                type = sb.WizardConfiguration.Name,
                                createdBy = sb.CreatedBy,
                                lockedToUser = sb.LockedToUser,
                                wizardStatusText = sb.WizardStatus.ToString(),
                                overAllSLAHours = System.Data.Entity.DbFunctions.DiffSeconds(sb.CreatedDate, DateTimeHelper.SaNow)
                            }).ToPagedResult(request);


                if (wizards.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<Wizard>
                    {
                        Page = wizards.Page,
                        PageCount = wizards.PageCount,
                        RowCount = wizards.RowCount,
                        PageSize = wizards.PageSize,
                        Data = new List<Wizard>()
                    };

                    var mappedWizard = _mapper.Map<List<Wizard>>(wizards.Data.Select(t => t.wizard));
                    foreach (var wizUpdate in mappedWizard)
                    {
                        SetWizardStatus(wizUpdate);
                        returnResult.Data.Add(wizUpdate);
                    }

                    return returnResult;
                }

                return new PagedRequestResult<Wizard>();
            }
        }

        public async Task<Wizard> StartWizard(StartWizardRequest wizardRequest)
        {
            if (wizardRequest == null)
            {
                throw new NullReferenceException("The wizard request cannot be null.");
            }

            if (await _configurationService.IsFeatureFlagSettingEnabled(fflStartWizardPermissionCheck) && !wizardRequest.RequestInitiatedByBackgroundProcess)
            {
                var result = await CanStartWizard(wizardRequest.Type);
                if (!result.Item1)
                    RmaIdentity.DemandPermission(result.Item2.First());
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Wizard wizard;

                if (wizardRequest.LinkedItemId > 0 && !wizardRequest.AllowMultipleWizards)
                {
                    var linkedWizard = await this._wizardRepository.SingleOrDefaultAsync(
                                           s => s.LinkedItemId == wizardRequest.LinkedItemId
                                                && s.WizardConfiguration.Name == wizardRequest.Type
                                                && (s.WizardStatus == WizardStatusEnum.InProgress
                                                    || s.WizardStatus == WizardStatusEnum.AwaitingApproval));

                    if (linkedWizard != null && linkedWizard.Id > 0)
                    {
                        wizard = await this.GetWizard(linkedWizard.Id);

                        if (wizard.WizardStatus != WizardStatusEnum.AwaitingApproval
                            || wizard.LockedToUser != wizard.ModifiedBy)
                        {
                            return wizard;
                        }

                        wizard.CanApprove = true;
                        wizard.ModifiedByDisplayName = wizard.ModifiedBy;
                        wizard.CreatedByDisplayName = wizard.CreatedBy;

                        return wizard;
                    }
                }

                var id = await this._wizardHost.StartWizard(wizardRequest);
                wizard = await this.GetWizard(id);

                await CreateWizardPermissionOverrides(wizardRequest, wizard);

                SetWizardStatus(wizard);
                wizard.StartType = "New";
                return wizard;
            }
        }

        private async Task CreateWizardPermissionOverrides(StartWizardRequest wizardRequest, Wizard wizard)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                if (wizardRequest.WizardPermissionOverrides?.Count > 0)
                {
                    foreach (var wizardPermissionOverride in wizardRequest.WizardPermissionOverrides)
                    {
                        wizardPermissionOverride.WizardId = wizard.Id;
                    }

                    _wizardPermissionOverrideRepository.Create(_mapper.Map<List<bpm_WizardPermissionOverride>>(wizardRequest.WizardPermissionOverrides));
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return;
                }
            }
        }

        private static IWizardProcess GetWizardProcess(string name)
        {
            var wizard = ServiceLocator.Current.GetInstance<IWizardProcess>(name);
            if (wizard == null) throw new TechnicalException($"Cannot find IWizardProcess with name {name}");
            return wizard;
        }

        private async Task<string> GetWizardNewName(SaveWizardRequest saveWizardRequest)
        {
            string name = string.Empty;
            try
            {
                var currentWizardDetails = await this.GetWizardOnly(saveWizardRequest.WizardId);
                var wizard = GetWizardProcess(currentWizardDetails.WizardConfiguration.Name);

                if (wizard != null)
                {
                    var resultName = await wizard.ChangeTheNameWizard(
                                         saveWizardRequest.Data,
                                         saveWizardRequest.WizardId,
                                         currentWizardDetails.Name);

                    if (!string.IsNullOrWhiteSpace(resultName))
                    {
                        await this.EditWizardName(saveWizardRequest.WizardId, resultName);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            return name;
        }

        public async Task SaveWizard(SaveWizardRequest saveWizardRequest)
        {
            Contract.Requires(saveWizardRequest != null);
            var wizard = await GetWizardAndCheckCanEdit(saveWizardRequest.WizardId, "save");

            if (IsCustomRoleChange(saveWizardRequest))
            {
                var roles = await _roleService.GetRoles();
                if (roles.SingleOrDefault(role => role.Id == saveWizardRequest.CustomRoutingRoleId.Value) == null)
                {
                    throw new BusinessException(
                       $"Error: Could not find a role with the id '{saveWizardRequest.CustomRoutingRoleId.Value}'");
                }
            }

            if (IsLockedUserChange(saveWizardRequest))
            {
                var users = await _userService.SearchUserByEmail(saveWizardRequest.LockedToUser);
                if (users == null)
                    throw new BusinessException($"Error: Could not find the user '{saveWizardRequest.LockedToUser}'");
            }


            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataWizard = await _wizardRepository.SingleAsync(s => s.Id == saveWizardRequest.WizardId,
                    $"Could not find wizard with id {saveWizardRequest.WizardId}");

                dataWizard.Data = saveWizardRequest.Data;
                dataWizard.CurrentStepIndex = saveWizardRequest.CurrentStep;
                if (dataWizard.Name != saveWizardRequest.WizardName)
                {
                    dataWizard.Name = saveWizardRequest.WizardName;
                }

                if (saveWizardRequest.UpdateCustomStatus)
                    dataWizard.CustomStatus = saveWizardRequest.CustomStatus;

                if (saveWizardRequest.UpdateCustomRoutingRoleId)
                    dataWizard.CustomRoutingRoleId = saveWizardRequest.CustomRoutingRoleId;

                if (saveWizardRequest.UpdateLockedUser)
                    dataWizard.LockedToUser = saveWizardRequest.LockedToUser;

                if (wizard.WizardStatus == WizardStatusEnum.New)
                    wizard.WizardStatus = WizardStatusEnum.InProgress;

                _wizardRepository.Update(dataWizard);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            await GetWizardNewName(saveWizardRequest);
            await _wizardHost.OnSaveStep(wizard);
        }

        public async Task SubmitWizard(int id)
        {
            var wizard = await GetWizardAndCheckCanEdit(id, "submit");

            if (wizard.HasApproval)
            {
                throw new BusinessException(
                   "Error: This wizard has approval, and therefore cannot be submitted directly, please request approval.");
            }

            if (wizard.WizardStatus != WizardStatusEnum.InProgress && wizard.WizardStatus != WizardStatusEnum.Disputed)
                throw new BusinessException("Error: Can only submit a wizard that is in progress or disputed.");

            if (!string.IsNullOrEmpty(wizard.LockedToUser) && !wizard.LockedToUser.Equals(RmaIdentity.Username, StringComparison.OrdinalIgnoreCase))
            {
                throw new BusinessException(
                   $"Error: Cannot submit a wizard that is locked to another user. This wizard is locked to {wizard.LockedToUserDisplayName}.");
            }

            await _wizardHost.SubmitWizard(wizard);
            await EditWizardStatus(wizard.Id, WizardStatusEnum.Completed, 0);
            await _wizardHost.UpdateStatus(wizard);
        }

        public async Task OverrideWizard(int id)
        {
            var wizard = await GetWizardAndCheckCanEdit(id, "submit");

            if (wizard.HasApproval)
            {
                throw new BusinessException(
                   "Error: This wizard has approval, and therefore cannot be submitted directly, please request approval.");
            }

            if (wizard.WizardStatus != WizardStatusEnum.InProgress && wizard.WizardStatus != WizardStatusEnum.Disputed)
                throw new BusinessException("Error: Can only submit a wizard that is in progress or disputed.");

            if (!string.IsNullOrEmpty(wizard.LockedToUser) && !wizard.LockedToUser.Equals(RmaIdentity.Username, StringComparison.OrdinalIgnoreCase))
            {
                throw new BusinessException(
                   $"Error: Cannot submit a wizard that is locked to another user. This wizard is locked to {wizard.LockedToUserDisplayName}.");
            }

            await _wizardHost.OverrideWizard(wizard);
            await EditWizardStatus(wizard.Id, WizardStatusEnum.Completed, 0);
            await _wizardHost.UpdateStatus(wizard);
        }

        public async Task CancelWizard(int id)
        {
            var wizard = await GetWizardAndCheckCanEdit(id, "cancel");

            if (wizard.WizardStatus != WizardStatusEnum.InProgress && wizard.WizardStatus != WizardStatusEnum.Disputed)
                throw new BusinessException("Error: Can only cancel a wizard that is in progress or disputed");

            await _wizardHost.CancelWizard(wizard);
            await EditWizardStatus(wizard.Id, WizardStatusEnum.Cancelled, 0);
            await AddStatusChangeNote(wizard, "cancelled");
            await _wizardHost.UpdateStatus(wizard);
        }

        public async Task CompletePrintWizard(int wizardId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var wizard = await _wizardRepository.SingleAsync(s => s.Id == wizardId,
                    $"Could not find wizard with id {wizardId}");
                _wizardRepository.Delete(wizard);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task RequestApproval(int id)
        {
            var wizard = await GetWizardAndCheckCanEdit(id, "request approval on");

            if (!wizard.HasApproval)
                throw new BusinessException("Error: This wizard does not have any approval, please submit this wizard instead");

            if (wizard.WizardStatus != WizardStatusEnum.InProgress && wizard.WizardStatus != WizardStatusEnum.Disputed)
                throw new BusinessException("Error: Can only request approval on a wizard that is in progress or disputed");

            await EditWizardStatus(id, WizardStatusEnum.AwaitingApproval, 0);
            await AddStatusChangeNote(wizard, "approval requested");
            await _wizardHost.UpdateStatus(wizard);

            await _wizardHost.OnRequestForApproval(wizard);
            await _wizardHost.OnSetApprovalStages(wizard);
        }

        public async Task ApproveWizard(int id)
        {
            var wizard = await GetWizardAndCheckCanApprove(id, "approve");
            var activePendingStages = new List<bpm_WizardApprovalStage>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                activePendingStages = await _wizardApprovalStageRepository.Where(ws => ws.WizardId == wizard.Id
                                      && ws.IsActive && ws.StatusId == (int)WizardApprovalStageStatusEnum.Pending).ToListAsync();
            }

            if (activePendingStages != null && activePendingStages.Count > 0)
            {
                var approvedStage = activePendingStages.OrderBy(ws => ws.Stage).FirstOrDefault();

                await UpdateApprovalStage(approvedStage.WizardApprovalStageId, WizardApprovalStageStatusEnum.Completed, RmaIdentity.Email);
                approvedStage.StatusId = (int)WizardApprovalStageStatusEnum.Completed;

                if (activePendingStages.Where(ws => ws.IsActive && ws.StatusId == (int)WizardApprovalStageStatusEnum.Pending).ToList().Count == 0)
                {
                    await CompleteApprovedWizard(wizard);
                }
                else
                {
                    var nextPendingStage = activePendingStages.FirstOrDefault(ws => ws.IsActive && ws.StatusId == (int)WizardApprovalStageStatusEnum.Pending);
                    wizard.CustomRoutingRoleId = nextPendingStage.RoleId;
                    wizard.LockedToUser = null;
                    wizard.WizardStatusId = (int)WizardStatusEnum.AwaitingApproval;
                    wizard.CustomStatus = $"Awaiting {nextPendingStage.Stage.OrdinalSuffix()} approver";
                    await UpdateWizard(wizard);
                }
                await _wizardHost.OnApprove(wizard);
            }
            else
            {
                await CompleteApprovedWizard(wizard);
            }
        }

        public async Task DisputeWizard(RejectWizardRequest rejectWizardRequest)
        {
            Contract.Requires(rejectWizardRequest != null);
            var wizard = await GetWizardAndCheckCanApprove(rejectWizardRequest.WizardId, "dispute");

            await EditWizardStatus(rejectWizardRequest.WizardId, WizardStatusEnum.Disputed, 0);
            await AddStatusChangeNote(wizard, rejectWizardRequest.Comment, "disputed");
            await _wizardHost.UpdateStatus(wizard);
            await _wizardHost.OnDispute(rejectWizardRequest, wizard);

            var activePendingStages = new List<bpm_WizardApprovalStage>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                activePendingStages = await _wizardApprovalStageRepository
                   .Where(ws => ws.WizardId == wizard.Id
                    && ws.IsActive && ws.StatusId == (int)WizardApprovalStageStatusEnum.Pending).ToListAsync();
            }
            if (activePendingStages != null && activePendingStages.Count > 0)
            {
                await DiscardAddtionalApprovalStages(activePendingStages.Select(s => s.WizardApprovalStageId).ToList(), "Disputed", WizardApprovalStageStatusEnum.Rejected);
            }
        }

        public async Task RejectWizard(RejectWizardRequest rejectWizardRequest)
        {
            Contract.Requires(rejectWizardRequest != null);
            var wizard = await GetWizardAndCheckCanApprove(rejectWizardRequest.WizardId, "reject");

            await EditWizardStatus(rejectWizardRequest.WizardId, WizardStatusEnum.Rejected, 0);
            await AddStatusChangeNote(wizard, rejectWizardRequest.Comment, "rejected");
            await _wizardHost.UpdateStatus(wizard);
            await _wizardHost.OnRejected(rejectWizardRequest, wizard);

            var activePendingStages = new List<bpm_WizardApprovalStage>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                activePendingStages = await _wizardApprovalStageRepository
                   .Where(ws => ws.WizardId == wizard.Id
                    && ws.IsActive && ws.StatusId == (int)WizardApprovalStageStatusEnum.Pending).ToListAsync();
            }
            if (activePendingStages != null && activePendingStages.Count > 0)
            {
                await DiscardAddtionalApprovalStages(activePendingStages.Select(s => s.WizardApprovalStageId).ToList(), "Rejected", WizardApprovalStageStatusEnum.Rejected);
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(int id)
        {
            var wizard = await GetWizard(id);
            return await _wizardHost.ExecuteWizardRules(wizard);
        }

        public async Task EditWizardName(int wizardId, string wizardName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var wizard = await _wizardRepository.SingleAsync(s => s.Id == wizardId,
                    $"Could not find wizard with id {wizardId}");

                wizard.Name = wizardName;
                _wizardRepository.Update(wizard);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> AddWizard(Wizard wizard)
        {
            Contract.Requires(wizard != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                wizard.WizardConfiguration = null;

                var dataWizard = _mapper.Map<bpm_Wizard>(wizard);
                dataWizard.WizardStatus = wizard.WizardStatus;
                dataWizard.CurrentStepIndex = 1;
                dataWizard.IsActive = true;
                dataWizard.IsDeleted = false;

                this._wizardRepository.Create(dataWizard);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return dataWizard.Id;
            }
        }

        public async Task<List<Wizard>> LastViewed()
        {
            string username = RmaIdentity.Username;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                const string lastViewedTypeString = nameof(ItemType.Wizard);

                var wizardList = await _lastViewedRepository
                    .Where(lastViewed => lastViewed.User == username && lastViewed.ItemType == lastViewedTypeString)
                    .OrderByDescending(lastViewed => lastViewed.Date)
                    .Take(5)
                    .Join(
                        _wizardRepository,
                        lastViewed => lastViewed.ItemId,
                        wizard => wizard.Id,
                        (lastViewed, wizard) => new Wizard
                        {
                            Id = wizard.Id,
                            Name = wizard.Name,
                            CurrentStep = wizard.CurrentStepIndex.ToString(),
                            Type = wizard.WizardConfiguration.DisplayName,
                            CustomStatus = wizard.CustomStatus,
                            WizardStatus = wizard.WizardStatus
                        })
                    .ToListAsync();

                wizardList.ForEach(wizard => SetWizardStatus(wizard));

                return wizardList;
            }
        }

        private bool FilterWizardPermissions(Wizard wizard, string username, int customRoutingRoleId)
        {
            return wizard.LockedToUser == username

                   //approvalWizards 
                   || (wizard.LockedToUser == null && wizard.WizardStatus == WizardStatusEnum.AwaitingApproval
                                                   && wizard.WizardConfiguration.ApprovalPermissions.Any(s => RmaIdentity.HasClaim(s)))

                   //continueStartedWizards 
                   || (wizard.LockedToUser == null && wizard.WizardStatus == WizardStatusEnum.InProgress && wizard.StartType == "Continue"
                       && wizard.WizardConfiguration.ContinuePermissions.Any(s => RmaIdentity.HasClaim(s)))

                   //customRoutingWizards
                   || (wizard.LockedToUser == null && wizard.CustomRoutingRoleId == customRoutingRoleId);
        }

        private static Expression<Func<bpm_Wizard, bool>> FilterUserWizards(string username, int customRoutingRoleId, bool canReAssignTask = false)
        {
            if (canReAssignTask)
            {
                return wizard =>
                    wizard.WizardStatus != WizardStatusEnum.Cancelled
                    && wizard.WizardStatus != WizardStatusEnum.Completed
                    && wizard.WizardStatus != WizardStatusEnum.Rejected;
            }

            return wizard =>
                wizard.WizardStatus != WizardStatusEnum.Cancelled
                && wizard.WizardStatus != WizardStatusEnum.Completed
                && wizard.WizardStatus != WizardStatusEnum.Rejected
                &&
                //Assigned wizards
                (wizard.LockedToUser == username
                 //created By user
                 || (wizard.LockedToUser == null
                        && wizard.CreatedBy == username)
                 //approvalWizards 
                 || (wizard.LockedToUser == null
                        && wizard.WizardStatus == WizardStatusEnum.AwaitingApproval)
                 || (wizard.LockedToUser == null
                        && wizard.WizardStatus == WizardStatusEnum.InProgress
                        && wizard.WizardConfiguration.WizardPermissions.Any(s => s.WizardPermissionType == WizardPermissionTypeEnum.Continue))
                 //customRoutingWizards
                 || (wizard.LockedToUser == null
                        && wizard.CustomRoutingRoleId == customRoutingRoleId
                 ));
        }

        public async Task EditWizardStatus(int wizardId, WizardStatusEnum wizardStatus, int customApproverRoleId)
        {
            using (var scope = this._dbContextScopeFactory.Create())
            {
                var wizard = await this._wizardRepository.SingleAsync(
                                 s => s.Id == wizardId,
                    $"Could not find wizard with id {wizardId}");

                wizard.CustomRoutingRoleId = customApproverRoleId;
                if (wizard.CustomRoutingRoleId == 0)
                {
                    wizard.CustomRoutingRoleId = null;
                }

                wizard.WizardStatus = wizardStatus;
                // The modified values do not update consistently
                wizard.ModifiedBy = RmaIdentity.Username ?? RmaIdentity.BackendServiceName;
                wizard.ModifiedDate = DateTime.Now;

                if (wizardStatus == WizardStatusEnum.Disputed || wizardStatus == WizardStatusEnum.Rejected)
                {
                    wizard.LockedToUser = wizardStatus == WizardStatusEnum.Rejected ? wizard.CreatedBy : await GetWizardApprovalRequestingUser(wizard.Id);
                    if (wizardStatus == WizardStatusEnum.Disputed)
                    {
                        wizard.WizardStatus = WizardStatusEnum.InProgress;
                        wizard.CustomStatus = WizardStatusEnum.Disputed.DisplayDescriptionAttributeValue();
                    }
                }
                else
                {
                    wizard.LockedToUser = null;
                }

                if (wizardStatus == WizardStatusEnum.Completed)
                {
                    wizard.EndDateAndTime = DateTimeHelper.SaNow;
                }

                this._wizardRepository.Update(wizard);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task<string> GetWizardApprovalRequestingUser(int wizardId)
        {
            string wizardApprovalRequestingUser = null;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await this._noteRepository.Where(s => s.ItemId == wizardId && s.ItemType == "Wizard" && s.Text.Contains("approval requested"))
                                 .OrderByDescending(n => n.Id)
                                 .FirstOrDefaultAsync();

                var noteMap = _mapper.Map<Note>(note);

                if (noteMap != null && !string.IsNullOrEmpty(noteMap.CreatedBy))
                    wizardApprovalRequestingUser = noteMap.CreatedBy;
            }

            return await Task.FromResult(wizardApprovalRequestingUser);

        }

        private static bool IsLockedUserChange(SaveWizardRequest saveWizardRequest)
        {
            return saveWizardRequest.UpdateLockedUser && !string.IsNullOrEmpty(saveWizardRequest.LockedToUser);
        }

        private async Task<Wizard> GetWizardAndCheckCanEdit(int id, string action)
        {
            var wizard = await GetWizard(id);

            if (!wizard.CanEdit && wizard.WizardStatus != WizardStatusEnum.Cancelled)
                throw new BusinessException($"Cannot {action} this wizard - '{wizard.LockedReason}'");

            SetWizardStatus(wizard);
            return wizard;
        }

        private static bool IsCustomRoleChange(SaveWizardRequest saveWizardRequest)
        {
            return saveWizardRequest.UpdateCustomRoutingRoleId && saveWizardRequest.CustomRoutingRoleId > 0;
        }

        private async Task AddStatusChangeNote(Wizard wizard, string action)
        {
            await _noteService.AddNoteForWizard(wizard.Id, $"The wizard's status was changed to {action} by {RmaIdentity.DisplayName}");
        }

        private async Task AddStatusChangeNote(Wizard wizard, string text, string action)
        {
            await _noteService.AddNoteForWizard(wizard.Id, $"The wizard was {action} by {RmaIdentity.DisplayName} with the comment: {text} ");
        }

        private async Task<Wizard> GetWizardAndCheckCanApprove(int id, string action)
        {
            var wizard = await GetWizard(id);
            if (!wizard.CanApprove)
                throw new BusinessException($"Cannot {action} this wizard - '{wizard.CantApproveReason}'");

            return wizard;
        }

        //*****************************************************************
        // PROCESS WIZARD
        private static bool CanUserStartWizard(Wizard wizard)
        {
            var startPermissions = wizard.WizardConfiguration.StartPermissions.ToArray();
            return !startPermissions.Any() || RmaIdentity.HasClaim(startPermissions);
        }

        private async Task<Tuple<bool, List<string>>> CanStartWizard(string name)
        {
            if (RmaIdentity.CurrentIdentity.FindAll("permission").Any(t => t.Value == "SuperMagicSecretClaim"))
            {
                return Tuple.Create(true, new List<string>());
            }

            var wizardConfiguration = await _wizardConfigurationService.GetWizardConfigurationByName(name);
            var startPermissions = wizardConfiguration.StartPermissions.ToArray();
            return Tuple.Create(!startPermissions.Any() || RmaIdentity.HasClaim(startPermissions), startPermissions.ToList());
        }

        private static void SetWizardStatus(Wizard wizard)
        {
            if (wizard == null)
            {
                return;
            }

            if (!string.IsNullOrEmpty(wizard.CustomStatus) && wizard.WizardStatus == WizardStatusEnum.InProgress)
            {
                wizard.WizardStatusText = $"{WizardStatusEnum.InProgress.DisplayAttributeValue()} - {wizard.CustomStatus}";
                return;
            }

            wizard.WizardStatusText = wizard.WizardStatus.DisplayAttributeValue();
        }

        private async Task<bool> ProcessWizardApproval(Wizard wizard)
        {
            if (wizard.WizardConfiguration?.ApprovalPermissions.Count == 0)
            {
                wizard.CantApproveReason = "This wizard does not have approval";
                return await Task.FromResult(false);
            }

            wizard.HasApproval = true;

            if (wizard.WizardStatus != WizardStatusEnum.AwaitingApproval)
            {
                wizard.CantApproveReason = $"This wizard cannot be approved/rejected because it's status is: {wizard.WizardStatus.DisplayAttributeValue()}.";
                return await Task.FromResult(false);
            }

            //IsLocked to a different user
            if (!string.IsNullOrWhiteSpace(wizard.LockedToUser) && !string.Equals(wizard.LockedToUser, RmaIdentity.Email, StringComparison.InvariantCultureIgnoreCase))
            {
                wizard.CantApproveReason = "You cannot approve/reject this wizard because it's locked to {0}.";
                return await Task.FromResult(false);
            }

            // Check the last user who modified the wizard, because the person who created it
            // is not necessarily the same one who created the wizard, especially when
            // the wizard was created by an automated process
            if (string.Equals(wizard.ModifiedBy, RmaIdentity.Email, StringComparison.InvariantCultureIgnoreCase))
            {
                wizard.CantApproveReason = "You cannot request and approve/reject the same wizard.";
                return await Task.FromResult(false);
            }

            //Is Auth Limit Approval Wizard
            if (wizard.WizardConfigurationId == _initiatePensionCaseWizardConfigurationId)// && (RmaIdentity.HasClaim(wizard.WizardConfiguration.ApprovalPermissions.ToArray())))
            {
                bool canApprove = await CheckRoleCanApproveCapitalizedValue(wizard);
                if (!canApprove)
                    return await Task.FromResult(false);
            }

            if (wizard.CustomRoutingRoleId > 0)
            {


                if (wizard.CustomRoutingRoleId == RmaIdentity.RoleId)
                {
                    wizard.CanApprove = true;
                    return await Task.FromResult(true);
                }

                if (wizard.CustomRoutingRoleId != RmaIdentity.RoleId)
                {
                    //verify wether this wizard has stepped/escalated approval
                    var approvalStages = new List<bpm_WizardApprovalStage>();
                    using (_dbContextScopeFactory.CreateReadOnly())
                    {
                        approvalStages = await _wizardApprovalStageRepository.Where(ws => ws.WizardId == wizard.Id
                && ws.IsActive).ToListAsync();
                    }
                    if (approvalStages.Any())
                    {
                        wizard.CanApprove = false;
                        wizard.CantApproveReason = "You do not have sufficient permissions to approve/reject this wizard step";
                        return await Task.FromResult(false);
                    }
                }
            }

            wizard.CanApprove = RmaIdentity.HasClaim(wizard.WizardConfiguration.ApprovalPermissions.ToArray());


            if (!wizard.CanApprove)
            {
                wizard.CantApproveReason = "You do not have sufficient permissions to approve/reject this wizard";
            }

            return await Task.FromResult(true);
        }

        private async Task<bool> CheckRoleCanApproveCapitalizedValue(Wizard wizard)
        {
            //TO DO: Make this implementation generic
            //So it can be used by other modules that make use of Role Authority Limits

            var roleAmountLimit = await _userService.GetAmountLimit((int)AmountLimitTypeEnum.PensionAuthorisationlimit).ConfigureAwait(false);

            var stepData = _serializer.Deserialize<ArrayList>(wizard.Data);
            var capitalizedValueModel = _serializer.Deserialize<CapitalizedValueModel>(stepData[0].ToString());

            if (capitalizedValueModel.PensionCase.VerifiedCV > roleAmountLimit)
            {
                wizard.CantApproveReason = $"You cannot approve wizard. Your Role Authority Limit '{roleAmountLimit.ToString("#,##0.00")}'  is less than Pension Case CV value '{capitalizedValueModel.PensionCase.VerifiedCV.ToString("#,##0.00")}'";
                return await Task.FromResult(false);
            }

            return await Task.FromResult(true);
        }

        private static void ProcessWizardCanEdit(Wizard wizard)
        {
            if (wizard.WizardStatus != WizardStatusEnum.InProgress
                && wizard.WizardStatus != WizardStatusEnum.Disputed
                && !wizard.WizardConfiguration.AllowEditOnApproval
                && wizard.WizardStatus != WizardStatusEnum.New)
            {
                wizard.LockedReason =
                    $"This wizard is in read-only mode because it's {wizard.WizardStatus.DisplayAttributeValue()}.";
                return;
            }

            if (string.IsNullOrEmpty(wizard.LockedToUser)
                || string.Compare(wizard.LockedToUser, RmaIdentity.Email, StringComparison.InvariantCultureIgnoreCase)
                == 0)
            {
                if (wizard.WizardStatus != WizardStatusEnum.AwaitingApproval ||
                    (wizard.WizardConfiguration.AllowEditOnApproval && wizard.WizardStatus == WizardStatusEnum.AwaitingApproval))
                {
                    wizard.CanEdit = true;
                }

                return;
            }

            wizard.LockedReason = "This wizard is in read-only mode because it's locked to user {0}.";
        }

        private static void SetCurrentStep(Wizard wizard)
        {
            wizard.CurrentStep = $"Step {wizard.CurrentStepIndex}";
        }

        //ISSUES
        private async Task<List<Wizard>> ProcessWizard(
            List<Wizard> wizards,
            bool clearConfiguration = false,
            bool clearData = false,
            bool checkPermissions = false,
            string userName = null,
            int roleId = -1,
            bool canReAssignTask = false)
        {
            var userNames = (wizards.Select(d => d.LockedToUser)
                                    .Concat(wizards.Select(d => d.ModifiedBy))
                                    .Concat(wizards.Select(d => d.CreatedBy)))
                            .Where(u => u != null)
                            .Distinct()
                            .ToList();

            var roleIds = wizards.Where(r => r.CustomRoutingRoleId.HasValue
                                             && r.CustomRoutingRoleId.Value > 0)
                .Select(r => r.CustomRoutingRoleId.Value).Distinct().ToList();

            var displayNames = await _userService.GetUserDisplayNames(userNames);
            var roles = await _roleService.GetRolesById(roleIds);

            var returnList = new List<Wizard>();

            foreach (var wizard in wizards)
            {
                if (wizard.WizardConfiguration == null && wizard.WizardConfigurationId > 0)
                {
                    wizard.WizardConfiguration = await this._wizardConfigurationService.GetWizardConfigurationById(wizard.WizardConfigurationId);
                }

                if (wizard.WizardConfiguration == null)
                {
                    throw new BusinessException($"Could not find a wizard configuration with the id {wizard.WizardConfigurationId}");
                }

                wizard.CanStart = CanUserStartWizard(wizard);
                wizard.StartType = "Continue";
                wizard.Type = wizard.WizardConfiguration.Name;

                SetWizardStatus(wizard);
                await ProcessWizardApproval(wizard);
                ProcessWizardCanEdit(wizard);
                SetCurrentStep(wizard);

                if (!string.IsNullOrWhiteSpace(wizard.LockedToUser))
                {
                    if (string.Compare(wizard.LockedToUser, RmaIdentity.Username, StringComparison.InvariantCultureIgnoreCase) == 0)
                    {
                        wizard.LockedToUserDisplayName = "You";
                    }
                    else
                    {
                        var displayName = displayNames.Where(d => d.Key == wizard.LockedToUser).Select(v => v.Value).SingleOrDefault();

                        var lockedToUserDisplayName = displayName ?? wizard.LockedToUser;
                        wizard.LockedToUserDisplayName = lockedToUserDisplayName;
                        wizard.LockedReason = string.Format(wizard.LockedReason, lockedToUserDisplayName);

                        if (wizard.CantApproveReason.Contains("{0}"))
                        {
                            wizard.CantApproveReason = string.Format(wizard.CantApproveReason, lockedToUserDisplayName);
                        }
                    }
                }

                //SetModifiedByDisplayName
                if (string.Compare(wizard.ModifiedBy, RmaIdentity.Username, StringComparison.InvariantCultureIgnoreCase) == 0)
                {
                    wizard.ModifiedByDisplayName = "You";
                }
                else if (!string.IsNullOrEmpty(wizard.ModifiedBy))
                {
                    var displayName = displayNames.Where(d => d.Key == wizard.ModifiedBy).Select(v => v.Value).SingleOrDefault();
                    wizard.ModifiedByDisplayName = displayName ?? wizard.ModifiedBy;
                }

                //SetCreatedByDisplayName
                if (string.Compare(wizard.CreatedBy, RmaIdentity.Username, StringComparison.InvariantCultureIgnoreCase) == 0)
                {
                    wizard.CreatedByDisplayName = "You";
                }
                else if (!string.IsNullOrEmpty(wizard.CreatedBy))
                {
                    var displayName = displayNames.Where(d => d.Key == wizard.CreatedBy).Select(v => v.Value).SingleOrDefault();
                    wizard.CreatedByDisplayName = displayName ?? wizard.CreatedBy;
                }

                //SetCustomRoutingRoleName
                if (wizard.CustomRoutingRoleId.HasValue && wizard.CustomRoutingRoleId.Value > 0)
                {
                    var displayName = roles.Where(d => d.Id == wizard.CustomRoutingRoleId.Value).Select(v => v.Name).SingleOrDefault();
                    wizard.CustomRoutingRole = displayName;
                }

                if (checkPermissions && !this.FilterWizardPermissions(wizard, userName, roleId) && !canReAssignTask)
                {
                    continue;
                }

                if (clearConfiguration)
                {
                    wizard.WizardConfiguration = null;
                }

                if (clearData)
                {
                    wizard.Data = null;
                }

                returnList.Add(wizard);
            }

            return returnList;
        }

        public async Task RejectOnCondition(RejectWizardRequest rejectWizardRequest)
        {
            Contract.Requires(rejectWizardRequest != null);
            var wizard = await GetWizardOnly(rejectWizardRequest.WizardId);

            await EditWizardStatus(rejectWizardRequest.WizardId, WizardStatusEnum.Rejected, 0);
            await AddStatusChangeNote(wizard, rejectWizardRequest.Comment, "rejected");

            await _wizardHost.OnRejected(rejectWizardRequest, wizard);
        }

        public async Task<List<Wizard>> GetWizardsByConfigurationAndItemId(List<int> linkedItemIds, string configName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository
                    .Where(c => c.WizardConfiguration.Name == configName && linkedItemIds.Contains((int)c.LinkedItemId))
                    .OrderByDescending(c => c.Id)
                    .ToListAsync();

                var result = _mapper.Map<List<Wizard>>(wizards);

                foreach (var wizard in result)
                {
                    wizard.Data = null;
                    wizard.WizardConfiguration = null;
                }

                return result;
            }
        }

        public async Task<List<Wizard>> GetActiveWizardsByConfigurationAndLinkedItemId(int linkedItemId, string configName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository
                    .Where(c => c.WizardConfiguration.Name == configName
                                && c.LinkedItemId == linkedItemId
                                && (c.WizardStatus == WizardStatusEnum.InProgress || c.WizardStatus == WizardStatusEnum.Disputed || c.WizardStatus == WizardStatusEnum.AwaitingApproval))
                    .OrderByDescending(c => c.Id)
                    .ToListAsync();

                var result = _mapper.Map<List<Wizard>>(wizards);

                foreach (var wizard in result)
                {
                    wizard.Data = null;
                    wizard.WizardConfiguration = null;
                }

                return result;
            }
        }

        public async Task SendWizardNotification(
            string wizardConfigurationName,
            string notificationTitle,
            string notificationMessage,
            string notificationActionLink,
            int linkedItemId,
            string lockedToUser)
        {
            var myNotification = new Notification
            {
                Title = notificationTitle,
                Message = notificationMessage,
                ActionLink = notificationActionLink, // eg. "http://localhost:4200/fincare/billing-manager"
                HasBeenReadAndUnderstood = false
            };

            var startWizardRequest = new StartWizardRequest
            {
                Type = wizardConfigurationName, //eg "fincare-notification",
                LinkedItemId = linkedItemId,
                Data = _serializer.Serialize(myNotification),
                LockedToUser = lockedToUser
            };

            await StartWizard(startWizardRequest);
        }

        public async Task BackgroundProcessApproveWizard(int id, bool submitWizard)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity =
                    await _wizardRepository.SingleAsync(s => s.Id == id, $"Could not find wizard with the id {id}");
                var wizard = _mapper.Map<Wizard>(entity);

                if (submitWizard)
                {
                    await _wizardHost.SubmitWizard(wizard);
                }

                await EditWizardStatus(wizard.Id, WizardStatusEnum.Completed, 0);
                await _noteService.AddNoteForWizard(wizard.Id,
                    $"The wizard's status was changed to approved by background process");

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<Wizard> GetWizardsByTypeAndLinkedItemId(string type, int linkedItemId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                return await this._wizardRepository.ProjectTo<Wizard>(_mapper.ConfigurationProvider)
              .SingleOrDefaultAsync(w => w.WizardConfiguration.Name == type
                        && w.LinkedItemId == linkedItemId);
            }
        }

        public async Task<Wizard> GetWizardsByTypeAndId(string type, int id)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                return await this._wizardRepository.ProjectTo<Wizard>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync(w => w.WizardConfiguration.Name == type && w.Id == id);
            }
        }

        public async Task<List<Wizard>> GetWizardsByConfigIdsAndCreatedBy(List<int> configIds, string createdBy, int claimId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                return await this._wizardRepository.ProjectTo<Wizard>(_mapper.ConfigurationProvider)
                           .Where(w => configIds.Contains(w.WizardConfigurationId)
                                       && w.CreatedBy == createdBy
                                       && w.LinkedItemId == claimId)
                           .ToListAsync();
            }
        }

        public async Task<List<Wizard>> GetWizardsInProgressByTypeAndLinkedItemId(string type, int linkedItemId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _wizardRepository
                           .Where(w => w.WizardConfiguration.Name == type
                                     && w.LinkedItemId == linkedItemId
                                     && (w.WizardStatus == WizardStatusEnum.New || w.WizardStatus == WizardStatusEnum.InProgress || w.WizardStatus == WizardStatusEnum.AwaitingApproval))
                           .ToListAsync();
                return _mapper.Map<List<Wizard>>(results);
            }
        }

        public async Task<List<Wizard>> GetWizardsInProgressByTypesAndLinkedItemId(int linkedItemId, List<string> types)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _wizardRepository
                           .Where(w => types.Contains(w.WizardConfiguration.Name)
                                     && w.LinkedItemId == linkedItemId
                                     && (w.WizardStatus == WizardStatusEnum.New || w.WizardStatus == WizardStatusEnum.InProgress || w.WizardStatus == WizardStatusEnum.AwaitingApproval))
                           .ToListAsync();
                await _wizardRepository.LoadAsync(results, w => w.WizardConfiguration);
                return _mapper.Map<List<Wizard>>(results);
            }
        }

        public async Task<bool> CheckIfWizardHasBeenCreated(string type, string data)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _wizardRepository
                    .Where(w => w.WizardConfiguration.Name == type
                                && w.Data.Contains(data))
                    .AnyAsync();
                return result;
            }
        }

        public async Task<List<Wizard>> GetUserWizardsByWizardConfigsAndEmail(List<int> wizardConfigIds, string email, int userRoleId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var roleId = userRoleId;
                var username = email;

                var allWizards = await QueryableExtensions.AsNoTracking(this._wizardRepository
                        .Where(wizard => wizardConfigIds.Contains(wizard.WizardConfigurationId))
                        .Where(FilterUserWizards(username, roleId)))
                    .AsQueryable()
                    .ToListAsync();

                var wizards = _mapper.Map<List<Wizard>>(allWizards);
                var result = await this.ProcessWizard(
                                 wizards,
                                 false,
                                 true,
                                 true,
                                 username,
                                 roleId);

                foreach (var wizard in result)
                {
                    const int interBankTransferWizardConfigId = 11;
                    if (wizard.WizardConfigurationId == interBankTransferWizardConfigId)
                    {
                        var entity = await _wizardRepository.Where(w => w.Id == wizard.Id).SingleAsync();
                        var stepData = _serializer.Deserialize<ArrayList>(entity.Data);
                        var interBankTransfer = _serializer.Deserialize<InterBankTransfer>(stepData[0].ToString());
                        if (interBankTransfer.InterDebtorTransfer != null)
                        {
                            wizard.Type = "inter-debtor-transfer";
                        }
                        else if (interBankTransfer.IsInitiatedByClaimPayment)
                        {
                            wizard.Type = "claims-interbank-transfer";
                        }
                    }
                }

                return result;
            }
        }

        public async Task<List<Wizard>> GetPortalUserWizards(string email, int userRoleId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var roleId = userRoleId;
                var username = email;

                var allWizards = await QueryableExtensions
                    .AsNoTracking(this._wizardRepository.Where(FilterUserWizards(username, roleId)))
                    .AsQueryable()
                    .ToListAsync();

                var wizards = _mapper.Map<List<Wizard>>(allWizards);
                var result = await this.ProcessWizard(
                    wizards,
                    true,
                    true,
                    true,
                    username,
                    roleId);
                return result;
            }
        }

        public async Task<List<Wizard>> GetPortalWizardsByConfigIdsAndCreatedBy(List<int> configIds, string createdBy)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                return await this._wizardRepository.ProjectTo<Wizard>(_mapper.ConfigurationProvider)
                    .Where(w => configIds.Contains(w.WizardConfigurationId)
                                && w.CreatedBy == createdBy)
                    .ToListAsync();
            }
        }

        public async Task UpdateWizardLockedToUser(int wizardId, int lockedToUserId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var wizard = await _wizardRepository.SingleAsync(s => s.Id == wizardId,
                    $"Could not find wizard with id {wizardId}");

                //0 is sent to unlock / unassign 
                if (lockedToUserId == 0)
                {
                    wizard.LockedToUser = string.Empty;
                }
                else
                {
                    var user = await _userService.GetUserById(lockedToUserId);
                    wizard.LockedToUser = user.Email;
                }

                _wizardRepository.Update(wizard);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<Wizard> GetWizardByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _wizardRepository
                    .ProjectTo<Wizard>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(w => w.Name.Contains(name));
            }
        }

        public Task<List<Wizard>> GetUserWizardsByWizardConfigs(List<int> wizardConfigIds)
        {
            throw new NotImplementedException();
        }
        private async Task CompleteApprovedWizard(Wizard wizard)
        {
            await _wizardHost.SubmitWizard(wizard);
            await EditWizardStatus(wizard.Id, WizardStatusEnum.Completed, 0);
            await AddStatusChangeNote(wizard, "approved");
        }

        private async Task UpdateApprovalStage(int stageId, WizardApprovalStageStatusEnum status, string userEmail)
        {
            if (stageId > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var stage = await _wizardApprovalStageRepository.FirstOrDefaultAsync(s => s.WizardApprovalStageId == stageId);
                    if (stage != null)
                    {
                        stage.StatusId = (int)status;
                        stage.ActionedBy = userEmail;
                        stage.ActionedDate = DateTime.Now.ToSaDateTime();
                        _wizardApprovalStageRepository.Update(stage);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
            }
        }

        private async Task DiscardAddtionalApprovalStages(List<int> stageIds, string reason, WizardApprovalStageStatusEnum status)
        {
            if (stageIds.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var stages = await _wizardApprovalStageRepository.Where(s => stageIds.Contains(s.WizardApprovalStageId)).ToListAsync();
                    if (stages.Count > 0)
                    {
                        foreach (var stage in stages)
                        {
                            stage.StatusId = (int)status;
                            stage.IsActive = false;
                            stage.ActionedDate = DateTime.Now.ToSaDateTime();
                            stage.Reason = reason;
                            stage.ActionedBy = SystemSettings.SystemUserAccount;
                        }
                        _wizardApprovalStageRepository.Update(stages);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
            }
        }

        public async Task SaveWizardApprovalStages(List<WizardApprovalStage> wizardApprovalStages)
        {
            if (wizardApprovalStages != null && wizardApprovalStages.Count > 0)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var stages = _mapper.Map<List<bpm_WizardApprovalStage>>(wizardApprovalStages);
                    _wizardApprovalStageRepository.Create(stages);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task<List<WizardApprovalStage>> GetWizardApprovalStages(int wizardId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var stages = new List<WizardApprovalStage>();

                var entities = await _wizardApprovalStageRepository.Where(w =>
                     w.WizardId == wizardId
                ).ToListAsync();

                if (entities?.Count > 0)
                {
                    stages = _mapper.Map<List<WizardApprovalStage>>(entities);
                }
                return stages;
            }
        }

        public async Task<List<Wizard>> GetWizardByWizardConfigurationIdAndWizardStatus(int WizardConfigurationId, DateTime startDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository.Where(x => x.WizardConfigurationId == WizardConfigurationId && x.WizardStatus == WizardStatusEnum.InProgress &&
                                                            x.StartDateAndTime.Value.Day == startDate.Day && x.StartDateAndTime.Value.Month == startDate.Month).Take(50).ToListAsync();
                return _mapper.Map<List<Wizard>>(wizards);
            }
        }

        public async Task<PagedRequestResult<Wizard>> GetPagedWizardsAssignedToMe(List<int> wizardConfigurationIds, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var filter = Convert.ToString(pagedRequest.SearchCriteria);
                    var username = RmaIdentity.Username;

                    var wizards = new PagedRequestResult<Wizard>();

                    if (wizardConfigurationIds?.Count > 0)
                    {
                        if (!string.IsNullOrEmpty(filter))
                        {
                            wizards = _mapper.Map<PagedRequestResult<Wizard>>(await _wizardRepository.Where(s => s.LockedToUser.Contains(username)
                                && (s.WizardStatus == WizardStatusEnum.InProgress || s.WizardStatus == WizardStatusEnum.AwaitingApproval || s.WizardStatus == WizardStatusEnum.Disputed)
                                && wizardConfigurationIds.Contains(s.WizardConfigurationId)
                                && s.Name.Contains(filter))
                                .ToPagedResult(pagedRequest));
                        }
                        else
                        {
                            wizards = _mapper.Map<PagedRequestResult<Wizard>>(await _wizardRepository.Where(s => s.LockedToUser.Contains(username)
                                && (s.WizardStatus == WizardStatusEnum.InProgress || s.WizardStatus == WizardStatusEnum.AwaitingApproval || s.WizardStatus == WizardStatusEnum.Disputed)
                                && wizardConfigurationIds.Contains(s.WizardConfigurationId))
                                .ToPagedResult(pagedRequest));
                        }
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(filter))
                        {
                            wizards = _mapper.Map<PagedRequestResult<Wizard>>(await _wizardRepository.Where(s => s.LockedToUser.Contains(username)
                                && (s.WizardStatus == WizardStatusEnum.InProgress || s.WizardStatus == WizardStatusEnum.AwaitingApproval || s.WizardStatus == WizardStatusEnum.Disputed)
                                && s.Name.Contains(filter))
                                .ToPagedResult(pagedRequest));
                        }
                        else
                        {
                            wizards = _mapper.Map<PagedRequestResult<Wizard>>(await _wizardRepository.Where(s => s.LockedToUser.Contains(username)
                                && (s.WizardStatus == WizardStatusEnum.InProgress || s.WizardStatus == WizardStatusEnum.AwaitingApproval || s.WizardStatus == WizardStatusEnum.Disputed))
                                .ToPagedResult(pagedRequest));
                        }
                    }


                    if (wizards?.Data.Count > 0)
                    {
                        foreach (var wizard in wizards?.Data)
                        {
                            wizard.WizardConfiguration = await GetWizardConfiguration(wizard.WizardConfigurationId);
                        }
                    }

                    return new PagedRequestResult<Wizard>
                    {
                        Data = wizards.Data,
                        RowCount = wizards.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(wizards.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            }
        }

        private async Task<WizardConfiguration> GetWizardConfiguration(int wizardConfigurationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
            {
                var configuration = await _wizardConfigurationRepository.FindByIdAsync(wizardConfigurationId);
                return _mapper.Map<WizardConfiguration>(configuration);
            }
        }

        public async Task<WizardPermission> GetWizardPermissionByWizardConfig(int wizardConfigId, WizardPermissionTypeEnum wizardPermission)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _wizardPermissionRepository.FirstOrDefaultAsync(t => t.WizardConfigurationId == wizardConfigId && t.WizardPermissionType == wizardPermission);

                return _mapper.Map<WizardPermission>(entity);
            }
        }

        public async Task<List<Wizard>> GetWizardsByConfigurationAndStatus(int WizardConfigurationId, WizardStatusEnum wizardStatus)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository.Where(x => x.WizardConfigurationId == WizardConfigurationId
                                                            && x.WizardStatus == wizardStatus)
                                                           .ToListAsync();
                return _mapper.Map<List<Wizard>>(wizards);
            }
        }

        public async Task<List<Wizard>> GetWizardsByConfigurationAndStatusAndFromToDate(int WizardConfigurationId, List<WizardStatusEnum> wizardStatuses, DateTime fromDate, DateTime toDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var wizards = await _wizardRepository.Where(x => x.WizardConfigurationId == WizardConfigurationId
                                                            && wizardStatuses.Contains(x.WizardStatus)
                                                            && x.CreatedDate >= fromDate
                                                            && x.CreatedDate <= toDate)
                                                           .ToListAsync();
                return _mapper.Map<List<Wizard>>(wizards);
            }
        }

        public async Task<bool> UpdateWizards(List<Wizard> wizards)
        {
            Contract.Requires(wizards != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var wizard in wizards)
                {
                    var entity = _wizardRepository.FirstOrDefault(s => s.Id == wizard.Id);
                    wizard.Data = entity.Data;
                    await _wizardHost.UpdateStatus(wizard);
                }

                var entities = _mapper.Map<List<bpm_Wizard>>(wizards);
                _wizardRepository.Update(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

    }
}