using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class AbilityCollectionsAuditFacade : RemotingStatelessService, IAbilityCollectionsAuditService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_AbilityCollectionsAudit> _abilityCollectionsAuditRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRolePlayerPolicyService _roleplayerPolicyService;
        private readonly IBankBranchService _bankBranchService;
        private readonly IInvoiceService _invoiceService;
        private readonly IConfigurationService _configurationService;

        public AbilityCollectionsAuditFacade(StatelessServiceContext context,
         IDbContextScopeFactory dbContextScopeFactory,
         IRolePlayerService rolePlayerService,
         IRepository<billing_AbilityCollectionsAudit> abilityCollectionsAuditRepository,
         IBankBranchService bankBranchService,
         IRolePlayerPolicyService roleplayerPolicyService,
         IInvoiceService invoiceService,
         IConfigurationService configurationService)
         : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _abilityCollectionsAuditRepository = abilityCollectionsAuditRepository;
            _rolePlayerService = rolePlayerService;
            _roleplayerPolicyService = roleplayerPolicyService;
            _bankBranchService = bankBranchService;
            _invoiceService = invoiceService;
            _configurationService = configurationService;
        }

        public async Task<List<AbilityCollectionsAudit>> GetAbilityPostingAudits()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudits = await _abilityCollectionsAuditRepository.ToListAsync();
                if (abilityPostingAudits.Any())
                {
                    return Mapper.Map<List<AbilityCollectionsAudit>>(abilityPostingAudits);
                }
                else
                {
                    return new List<AbilityCollectionsAudit>();
                }

            }
        }

        public async Task<List<AbilityCollectionsAudit>> GetAbilityPostingAuditsToProcess()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudits = await _abilityCollectionsAuditRepository
                    .Where(x => x.IsProcessed == false).ToListAsync();
                if (abilityPostingAudits.Any())
                {
                    return Mapper.Map<List<AbilityCollectionsAudit>>(abilityPostingAudits);
                }
                else
                {
                    return new List<AbilityCollectionsAudit>();
                }

            }
        }

        public async Task<AbilityCollectionsAudit> GetAbilityPostingAudit(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var abilityPostingAudit = await _abilityCollectionsAuditRepository
                    .ProjectTo<AbilityCollectionsAudit>()
                    .SingleAsync(prod => prod.Id == id,
                        $"Could not find AbilityCollectionsAudit with id {id}");

                return Mapper.Map<AbilityCollectionsAudit>(abilityPostingAudit);
            }
        }

        public async Task EditAbilityPostingAudit(AbilityCollectionsAudit abilityPostingAudit)
        {
            if (abilityPostingAudit != null)
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.EditBillingAudit);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var dataCrossRef = await _abilityCollectionsAuditRepository.Where(x => x.Id == abilityPostingAudit.Id).SingleAsync();

                    dataCrossRef.IsProcessed = abilityPostingAudit.IsProcessed;
                    _abilityCollectionsAuditRepository.Update(dataCrossRef);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                }
            }
        }

        public async Task<int> AddAbilityPostingAudit(AbilityCollectionsAudit abilityPostingAudit)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_AbilityCollectionsAudit>(abilityPostingAudit);
                _abilityCollectionsAuditRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<int> AddAbilityCollectionsAudit(int invoiceId, string batchReference)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceService.GetInvoice(invoiceId);
                var strDate = DateTimeHelper.SaNow.ToString("ddMMyyyy");
                var policy = await _roleplayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);
                var bankingDetails = await _rolePlayerService.GetActiveBankingDetails(policy.PolicyPayeeId);
                var rolePlayer = await _rolePlayerService.GetRolePlayerWithoutReferenceData(policy.PolicyPayeeId);
                var bankBranch = await _bankBranchService.GetBankBranch(bankingDetails.BankBranchId);

                var abilityCollectionsAudit = new AbilityCollectionsAudit
                {
                    Reference = rolePlayer.RolePlayerIdentificationType == Admin.MasterDataManager.Contracts.Enums.RolePlayerIdentificationTypeEnum.Person ? "COLIND-" + strDate : "COLGRP-" + strDate,
                    InvoiceId = invoice.InvoiceId,
                    BatchReference = batchReference,
                    Amount = invoice.TotalInvoiceAmount,
                    OnwerDetails = rolePlayer.DisplayName,
                    Bank = bankBranch?.Bank.Name,
                    BankBranch = bankBranch?.Name,
                    AccountDetails = bankingDetails?.AccountNumber,
                    IsProcessed = false
                };

                var entity = Mapper.Map<billing_AbilityCollectionsAudit>(abilityCollectionsAudit);
                _abilityCollectionsAuditRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task RemoveAbilityPostingAudit(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                _abilityCollectionsAuditRepository.Delete(d => d.Id == id);
                await scope.SaveChangesAsync();
            }
        }
    }
}
