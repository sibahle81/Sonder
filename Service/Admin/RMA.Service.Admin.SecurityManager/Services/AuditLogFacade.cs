using CommonServiceLocator;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class AuditLogFacade : RemotingStatelessService, IAuditLogService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditLogV1Service _auditLogService;

        public AuditLogFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IAuditLogV1Service auditLogService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _auditLogService = auditLogService;
        }

        public async Task<AuditResult> GetAuditLog(int id)
        {
            var result = await _auditLogService.GetAuditLog(id);
            Action<AuditResult> getLookupDetails = UserLookup;
            result.ExtractPropertyDetails(getLookupDetails);
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            var result = await _auditLogService.GetAuditLogsByToken(correlationToken);
            Action<AuditResult> getLookupDetails = UserLookup;
            result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogs(string itemTypeName, int itemId)
        {
            var result = await _auditLogService.GetAuditLogs(itemTypeName, itemId);
            Action<AuditResult> getLookupDetails = UserLookup;
            result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            return result;
        }

        private void UserLookup(AuditResult audit)
        {
            if (audit.ItemType == "User")
            {
                audit.OldItem = ParseUser(audit.OldItem);
                audit.NewItem = ParseUser(audit.NewItem);
            }
        }

        private string ParseUser(string user)
        {
            if (user == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(user);

            item.Remove("ClientUsers");
            item.Remove("UserPasswords");
            item.Remove("UserPreferences");
            item.Remove("WorkPoolUsers");
            item.Remove("Password");
            item.Remove("Token");

            if (item.TenantId != null)
                item.Tenant = GetTenantName(item.TenantId);
            if (item.RoleId != null)
                item.Role = GetRoleName(item.RoleId);
            if (item.AuthenticationTypeId != null)
                item.AuthenticationTypeId = GetAuthenticationTypeName(item.AuthenticationTypeId);
            if (item.AuthenticationType != null)
                item.AuthenticationType = GetAuthenticationTypeName(item.AuthenticationType);

            return JsonConvert.SerializeObject(item);
        }

        private dynamic GetTenantName(dynamic tenantId)
        {
            if (tenantId == null) return string.Empty;
            if (tenantId is string) return tenantId;
            if (int.TryParse($"{tenantId}", out int itemId))
            {
                if (itemId == 0) return "None";
                var service = ServiceLocator.Current.GetInstance<ITenantService>();
                if (service == null) return "";
                var tenant = service.GetTenant(itemId).Result;
                return tenant.Name;
            }
            return string.Empty;
        }

        private dynamic GetRoleName(dynamic roleId)
        {
            if (roleId == null) return string.Empty;
            if (roleId is string) return roleId;
            if (int.TryParse($"{roleId}", out int itemId))
            {
                if (itemId == 0) return "None";
                var service = ServiceLocator.Current.GetInstance<IRoleService>();
                if (service == null) return "";
                var product = service.GetRole(itemId).Result;
                return product.Name;
            }
            return string.Empty;
        }

        private dynamic GetAuthenticationTypeName(dynamic autheticationTypeId)
        {
            if (autheticationTypeId == null) return string.Empty;
            if (autheticationTypeId is string) return autheticationTypeId;
            if (int.TryParse($"{autheticationTypeId}", out int itemId))
            {
                return ((AuthenticationTypeEnum)autheticationTypeId).ToString();
            }
            return string.Empty;
        }

        public async Task<PagedRequestResult<AuditResult>> GetAuditLogsPaged(string itemTypeName, PagedRequest request)
        {
            var result = await _auditLogService.GetAuditLogsPaged(itemTypeName, request);

            if (result.Data != null)
            {
                foreach (var item in result.Data)
                {
                    var oldAuditItem = JsonConvert.DeserializeObject<JObject>(item.OldItem);
                    var newAuditItem = JsonConvert.DeserializeObject<JObject>(item.NewItem);

                    foreach (var child in newAuditItem.Children().ToList())
                    {
                        var newValue = string.Empty;
                        int itemCount = 0;
                        foreach (var childValue in child.Values())
                        {
                            itemCount++;
                            newValue += itemCount > 1 ? $", {Convert.ToString(childValue)}" : Convert.ToString(childValue);
                        }

                        var oldValue = Convert.ToString(oldAuditItem.GetValue(child.Path));
                        item.PropertyDetails.Add(new AuditLogPropertyDetail(child.Path, oldValue, newValue));
                    }
                }
            }
            return result;
        }
    }
}
