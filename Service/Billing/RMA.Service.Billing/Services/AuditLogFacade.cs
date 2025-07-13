using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using IAuditLogService = RMA.Service.Billing.Contracts.Interfaces.IAuditLogService;

namespace RMA.Service.Billing.Services
{
    public class AuditLogFacade : RemotingStatelessService, IAuditLogService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_AuditLog> _auditLogRepository;
        private readonly IConfigurationService _configurationService;

        public AuditLogFacade(StatelessServiceContext context
          , IDbContextScopeFactory dbContextScopeFactory,
          IRepository<billing_AuditLog> auditAuditLogRepository,
            IConfigurationService configurationService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _auditLogRepository = auditAuditLogRepository;
            _configurationService = configurationService;
        }

        public async Task<List<Billing.Contracts.Entities.AuditResult>> GetAuditLogs(string itemTypeName, int itemId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingAudit);

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var dbItems = await _auditLogRepository.Where(a => a.ItemType == itemTypeName && a.ItemId == itemId).ToListAsync();
                    //var results = dbItems.GroupBy(g => new DateTime(g.Date.Year, g.Date.Month, g.Date.Day, g.Date.Hour, g.Date.Minute, g.Date.Second)).Select(s => s.FirstOrDefault()).ToList();
                    var result = new List<Billing.Contracts.Entities.AuditResult>();
                    foreach (var auditLog in dbItems)
                    {
                        result.Add(new Billing.Contracts.Entities.AuditResult(auditLog.Id,
                            auditLog.ItemId,
                            auditLog.ItemType,
                            auditLog.Date,
                            auditLog.Username,
                            auditLog.Action,
                            auditLog.CorrolationToken ?? "",
                            auditLog.OldItem ?? "{}",
                            auditLog.NewItem ?? "{}"));
                    }

                    return result.OrderByDescending(x => x.Date).ToList();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<int> AddAudit(Admin.MasterDataManager.Contracts.Audit.AuditResult auditResult)
        {
            Contract.Requires(auditResult != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddBillingAudit);

            using (var scope = _dbContextScopeFactory.Create())
            {
                auditResult.Date = DateTimeHelper.SaNow;
                var entity = Mapper.Map<billing_AuditLog>(auditResult);
                _auditLogRepository.Create(entity);
                return await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }
    }
}
