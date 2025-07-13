using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Broker
{
    public class AuditLogFacade : RemotingStatelessService, IAuditLogService
    {
        private readonly IAuditLogV1Service _auditLogService;

        public AuditLogFacade(StatelessServiceContext context, IAuditLogV1Service auditLogService) : base(context)
        {
            _auditLogService = auditLogService;
        }

        public async Task<AuditResult> GetAuditLog(int id)
        {
            AuditResult result = null;
            if (id > 0)
            {
                result = await _auditLogService.GetAuditLog(id);
                Action<AuditResult> getLookupDetails = BrokerLookup;
                result.ExtractPropertyDetails(getLookupDetails);
            }
                 return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            List<AuditResult> result = null;
            if (!string.IsNullOrEmpty(correlationToken))
            {
                result = await _auditLogService.GetAuditLogsByToken(correlationToken);
                Action<AuditResult> getLookupDetails = BrokerLookup;
                result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            }
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId)
        {
            List<AuditResult> result=null;
            if (itemType != null && itemId > 0)
            {
                result = await _auditLogService.GetAuditLogs(itemType, itemId);
                Action<AuditResult> getLookupDetails = BrokerLookup;
                result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            }
            return result;
        }

        public async Task<PagedRequestResult<AuditResult>> GetAuditLogsPaged(string itemTypeName, PagedRequest request)
        {
            PagedRequestResult<AuditResult> result=null;
            if (!string.IsNullOrEmpty(itemTypeName))
            {
                result = await _auditLogService.GetAuditLogsPaged(itemTypeName, request);
            }

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

        private void BrokerLookup(AuditResult audit)
        {
            switch (audit.ItemType)
            {
                case "broker_Brokerage":
                    audit.OldItem = ParseBrokerage(audit.OldItem);
                    audit.NewItem = ParseBrokerage(audit.NewItem);
                    break;
                default:
                    audit.OldItem = ParseBrokerage(audit.OldItem);
                    audit.NewItem = ParseBrokerage(audit.NewItem);
                    break;
            }
        }

        private string ParseBrokerage(string broker)
        {
            if (broker == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(broker);

            return JsonConvert.SerializeObject(item);
        }
    }
}
