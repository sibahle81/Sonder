using Newtonsoft.Json;

using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Member
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
            if (id> 0)
            {
                result = await _auditLogService.GetAuditLog(id);
                Action<AuditResult> getLookupDetails = AuditLookup;
                result.ExtractPropertyDetails(getLookupDetails);
            }
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            List<AuditResult> result = null;
            if (string.IsNullOrEmpty(correlationToken))
            {
                result = await _auditLogService.GetAuditLogsByToken(correlationToken);
                Action<AuditResult> getLookupDetails = AuditLookup;
                result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            }
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId)
        {
            List<AuditResult> result = null;
            if (string.IsNullOrEmpty(itemType) && itemId>0)
            {
                result = await _auditLogService.GetAuditLogs(itemType, itemId);
                Action<AuditResult> getLookupDetails = AuditLookup;
                result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            }
            return result;
        }

        private void AuditLookup(AuditResult audit)
        {
            switch (audit?.ItemType)
            {
                case "Lead":
                    audit.OldItem = ParseLead(audit?.OldItem);
                    audit.NewItem = ParseLead(audit?.NewItem);
                    break;
            }
        }

        private string ParseLead(string auditItem)
        {
            if (auditItem == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(auditItem);

            return JsonConvert.SerializeObject(item);
        }


    }
}
