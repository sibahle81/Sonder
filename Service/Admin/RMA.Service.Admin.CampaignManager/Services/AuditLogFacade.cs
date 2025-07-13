using CommonServiceLocator;

using Newtonsoft.Json;

using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class AuditLogFacade : RemotingStatelessService, Contracts.Interfaces.IAuditLogService
    {
        private readonly IAuditLogV1Service _auditLogService;

        public AuditLogFacade(StatelessServiceContext context, IAuditLogV1Service auditLogService) : base(context)
        {
            _auditLogService = auditLogService;
        }

        public async Task<AuditResult> GetAuditLog(int id)
        {
            var result = await _auditLogService.GetAuditLog(id);
            Action<AuditResult> getLookupDetails = CampaignLookup;
            result.ExtractPropertyDetails(getLookupDetails);
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            var result = await _auditLogService.GetAuditLogsByToken(correlationToken);
            Action<AuditResult> getLookupDetails = CampaignLookup;
            result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId)
        {
            var result = await _auditLogService.GetAuditLogs(itemType, itemId);
            Action<AuditResult> getLookupDetails = CampaignLookup;
            result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            return result;
        }

        private void CampaignLookup(AuditResult audit)
        {
            audit.OldItem = ParseCampaign(audit.OldItem);
            audit.NewItem = ParseCampaign(audit.NewItem);
        }

        private string ParseCampaign(string campaign)
        {
            if (campaign == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(campaign);

            item.Remove("Emails");
            item.Remove("Sms");
            item.Remove("Reminders");
            item.Remove("TargetAudiences");
            item.Remove("ImportFiles");

            if (item.CampaignType != null)
                item.CampaignType = ((CampaignTypeEnum)item.CampaignType).ToString();
            if (item.CampaignCategory != null)
                item.CampaignCategory = ((CampaignCategoryEnum)item.CampaignCategory).ToString();
            if (item.CampaignStatus != null)
                item.CampaignStatus = ((CampaignStatusEnum)item.CampaignStatus).ToString();

            if (item.RoleId != null)
                item.Role = GetRoleName(item.RoleId);
            if (item.ProductId != null)
                item.Product = GetProductName(item.ProductId);

            return JsonConvert.SerializeObject(item);
        }

        private static dynamic GetRoleName(dynamic roleId)
        {
            if (roleId == null) return string.Empty;
            if (roleId is string) return roleId;
            if (int.TryParse($"{roleId}", out int itemId))
            {
                if (itemId == 0) return "None";
                var service = ServiceLocator.Current.GetInstance<IRoleService>();
                if (service == null) return "";
                var role = service.GetRole(itemId).Result;
                return role.Name;
            }
            return string.Empty;
        }

        private static dynamic GetProductName(dynamic productId)
        {
            if (productId == null) return string.Empty;
            if (productId is string) return productId;
            if (int.TryParse($"{productId}", out int itemId))
            {
                if (itemId == 0) return "None";
                var service = ServiceLocator.Current.GetInstance<IProductService>();
                if (service == null) return "";
                var product = service.GetProduct(itemId).Result;
                return product.Name;
            }
            return string.Empty;
        }
    }
}
