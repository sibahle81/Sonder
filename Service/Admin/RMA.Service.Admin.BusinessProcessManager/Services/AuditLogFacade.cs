using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Audit.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class AuditLogFacade : RemotingStatelessService, IAuditLogService
    {
        private readonly IAuditLogV1Service _auditLogService;

        public AuditLogFacade(StatelessServiceContext context, IAuditLogV1Service auditLogService)
            : base(context)
        {
            _auditLogService = auditLogService;
        }

        public Task<AuditResult> GetAuditLog(int id)
        {
            return _auditLogService.GetAuditLog(id);
        }

        public Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            return _auditLogService.GetAuditLogsByToken(correlationToken);
        }

        public Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId)
        {
            return _auditLogService.GetAuditLogs(itemType, itemId);
        }

        //public async Task<AuditResult> GetAuditLogsByTokenWithLookups(Guid correlationToken)
        //{
        //    var corrolatedAuditLogs = _auditLogRepository.Where(c => c.CorrolationToken == correlationToken).ToList();
        //    var list = new List<LookupAuditDetails>();

        //    foreach (var corrolatedAuditLog in corrolatedAuditLogs)
        //    {
        //        var auditlog = await _auditLogRepository.FindByIdAsync(corrolatedAuditLog.Id);

        //        var oldAuditItem = JsonConvert.DeserializeObject<JObject>(auditlog.OldItem);
        //        var newAuditItem = JsonConvert.DeserializeObject<JObject>(auditlog.NewItem);

        //        var children = oldAuditItem.Children().ToList();
        //        list.AddRange(from child in children
        //                      let newValues = Convert.ToString(newAuditItem.GetValue(child.Path))
        //                      let oldValues = Convert.ToString(oldAuditItem.GetValue(child.Path))
        //                      where child.Path == "Lookups"
        //                      select GetLookupsAudit(oldValues, newValues)
        //            into lookupItems
        //                      where lookupItems.Count > 0
        //                      select new LookupAuditDetails
        //                      {
        //                          ItemType = auditlog.ItemType,
        //                          LookupAuditResultDetails = lookupItems
        //                      });
        //    }

        //    if (corrolatedAuditLogs.Count <= 0) return null;
        //    var auditResult = await GetAuditLog(corrolatedAuditLogs.First().Id);

        //    //LOOKUPS------------------------------------------------------------------------------------------------------------
        //    foreach (var auditLogDetail in auditResult.AuditLogDetails)
        //    {
        //        var api = string.Empty;
        //        var isLookup = false;
        //        if (!_ignoredLookups.Contains(auditLogDetail.PropertyName))
        //        {
        //            if (auditLogDetail.PropertyName.EndsWith("ids", StringComparison.OrdinalIgnoreCase))
        //            {
        //                api = auditLogDetail.PropertyName.Replace("Ids", string.Empty);
        //                isLookup = true;
        //            }

        //            if (auditLogDetail.PropertyName.EndsWith("id", StringComparison.OrdinalIgnoreCase))
        //            {
        //                api = auditLogDetail.PropertyName.Replace("Id", string.Empty);
        //                if (!string.IsNullOrEmpty(api)) isLookup = true;
        //            }
        //        }

        //        if (isLookup)
        //        {
        //            var masterlookups = await GetLookups(api);

        //            var oldLookupValues = masterlookups.Where(s => auditLogDetail.OldValue == s.Id.ToString());
        //            var newLookupValues = masterlookups.Where(s => auditLogDetail.NewValue == s.Id.ToString());

        //            var oldLookups = new List<Lookup>();
        //            foreach (var oldLookupValue in oldLookupValues)
        //            {
        //                oldLookups.Add(new Lookup
        //                {
        //                    Id = oldLookupValue.Id,
        //                    Name = oldLookupValue.Name
        //                });
        //            }

        //            var newLookups = new List<Lookup>();
        //            foreach (var newLookupValue in newLookupValues)
        //            {
        //                newLookups.Add(new Lookup
        //                {
        //                    Id = newLookupValue.Id,
        //                    Name = newLookupValue.Name
        //                });
        //            }

        //            var oldValues = JsonConvert.SerializeObject(oldLookups, Formatting.None);
        //            var newValues = JsonConvert.SerializeObject(newLookups, Formatting.None);

        //            var lookupsAuditItems = GetLookupsAudit(oldValues, newValues);

        //            if (lookupsAuditItems.Count == 0)
        //            {
        //                lookupsAuditItems.Add(new LookupAuditItem
        //                {
        //                    Value = "<no data>",
        //                    Status = Convert.ToString(AuditItemStatus.Unchanged)
        //                });
        //            }

        //            var lookupAuditDetails = new List<LookupAuditDetails>
        //            {
        //                new LookupAuditDetails
        //                {
        //                    ItemType = auditLogDetail.PropertyName,
        //                    LookupAuditResultDetails = lookupsAuditItems
        //                }
        //            };

        //            list.AddRange(lookupAuditDetails);
        //        }
        //    }

        //    //-------------------------------------------------------------------------------------------------------------------
        //    auditResult.LookupAuditLogDetails = list;
        //    FormatData(auditResult);
        //    return auditResult;
        //}

        //private async Task<List<Lookup>> GetLookups(string type)
        //{
        //    if (type == "Province")
        //    {
        //        return (await _stateProvinceService.GetStateProvinces()).ToList()
        //           .Select(n => new Lookup { Id = n.Id, Name = n.Name }).ToList();
        //    }

        //    throw new NotImplementedException();
        //}

        //private static List<LookupAuditItem> GetLookupsAudit(string oldValues, string newValues)
        //{
        //    var lookupAuditResultDetails = new List<LookupAuditItem>();

        //    var oldLookups = JsonConvert.DeserializeObject<JArray>(oldValues);
        //    var newLookups = JsonConvert.DeserializeObject<JArray>(newValues);

        //    if (oldLookups == null)
        //    {
        //        lookupAuditResultDetails.AddRange(from JObject newLookup in newLookups
        //                                          select new LookupAuditItem
        //                                          {
        //                                              Status = Convert.ToString(AuditItemStatus.New),
        //                                              Value = Convert.ToString(newLookup.GetValue("Name"))
        //                                          });
        //    }
        //    else
        //    {
        //        var oldValuesToCompare =
        //            (from JObject oldLookup in oldLookups select Convert.ToString(oldLookup.GetValue("Name"))).ToList();
        //        var newValuesToCompare =
        //            (from JObject newLookup in newLookups select Convert.ToString(newLookup.GetValue("Name"))).ToList();

        //        foreach (var oldValueToCompare in oldValuesToCompare) // IF OLD VALUE IS IN NEW LIST THEN UNCHANGED
        //        {
        //            if (newValuesToCompare.Contains(oldValueToCompare))
        //            {
        //                lookupAuditResultDetails.Add(new LookupAuditItem
        //                {
        //                    Status = Convert.ToString(AuditItemStatus.Unchanged),
        //                    Value = oldValueToCompare
        //                });
        //            }

        //            if (!newValuesToCompare.Contains(oldValueToCompare)) // IF OLD VALUE IS NOT IN NEW LIST THEN REMOVED
        //            {
        //                lookupAuditResultDetails.Add(new LookupAuditItem
        //                {
        //                    Status = Convert.ToString(AuditItemStatus.Removed),
        //                    Value = oldValueToCompare
        //                });
        //            }
        //        }

        //        foreach (var newValueToCompare in newValuesToCompare) // IF NEW VALUE IS NOT IN OLD LIST THEN ADDED
        //        {
        //            if (!oldValuesToCompare.Contains(newValueToCompare))
        //            {
        //                lookupAuditResultDetails.Add(new LookupAuditItem
        //                {
        //                    Status = Convert.ToString(AuditItemStatus.Added),
        //                    Value = newValueToCompare
        //                });
        //            }
        //        }
        //    }

        //    return lookupAuditResultDetails;
        //}
    }
}