using CommonServiceLocator;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using IAuditLogService = RMA.Service.ClientCare.Contracts.Interfaces.Client.IAuditLogService;

namespace RMA.Service.ClientCare.Services.Client
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
            AuditResult result=null;
            if (id > 0)
            {
                result = await _auditLogService.GetAuditLog(id);
                Action<AuditResult> getLookupDetails = AuditLookup;
                result.ExtractPropertyDetails(getLookupDetails);
            }
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            List < AuditResult > result=null;
            if (!string.IsNullOrEmpty( correlationToken))
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
            if (string.IsNullOrEmpty(itemType) && itemId > 0)
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
                case "Client":
                    audit.OldItem = ParseClient(audit?.OldItem);
                    audit.NewItem = ParseClient(audit?.NewItem);
                    break;
            }
        }

        private string ParseClient(string user)
        {
            if (user == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(user);

            item.Remove("ClientLogos");
            item.Remove("Clients");
            item.Remove("CommunicationPreferences");
            item.Remove("Departments");
            item.Remove("Enquiries");

            if (item.ClientTypeId != null)
                item.ClientType = GetClientType(item.ClientTypeId);
            if (item.GroupId != null)
                item.Group = GetGroup(item.GroupId);
            if (item.IndustryId != null)
                item.Industry = GetIndustry(item.IndustryId);
            if (item.IndustryClassId != null)
                item.IndustryClass = (IndustryClassEnum)item.IndustryClassId;

            return JsonConvert.SerializeObject(item);
        }

        private dynamic GetClientType(dynamic clientTypeId)
        {
            return ((ClientTypeEnum)clientTypeId).ToString();
        }


        private City GetCity(int cityId)
        {
            if (cityId == 0) return null;
            var service = ServiceLocator.Current.GetInstance<ICityService>();
            if (service == null) return null;
            var result = service.GetCityById(cityId).Result;
            return result;
        }

        private StateProvince GetProvince(int provinceId)
        {
            if (provinceId == 0) return null;
            var service = ServiceLocator.Current.GetInstance<IStateProvinceService>();
            if (service == null) return null;
            var result = service.GetStateProvinceById(provinceId).Result;
            return result;
        }

        private Country GetCountry(int countryId)
        {
            if (countryId == 0) return null;
            var service = ServiceLocator.Current.GetInstance<ICountryService>();
            if (service == null) return null;
            var result = service.GetCountryById(countryId).Result;
            return result;
        }

        private dynamic GetGroup(dynamic groupId)
        {
            if (groupId == null) return string.Empty;
            if (groupId is string) return groupId;
            if (int.TryParse($"{groupId}", out int itemId))
            {
                if (itemId == 0) return "None";

            }
            return string.Empty;
        }

        private dynamic GetIndustry(dynamic industryId)
        {
            if (industryId == null) return string.Empty;
            if (industryId is string) return industryId;
            if (int.TryParse($"{industryId}", out int itemId))
            {
                if (itemId == 0) return "None";
                var service = ServiceLocator.Current.GetInstance<IIndustryService>();
                if (service == null) return "";
                var industry = service.GetIndustry(itemId).Result;
                return industry.Name;
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
