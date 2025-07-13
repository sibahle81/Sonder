using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Audit
{
    [DataContract]
    public class AuditResult
    {
        [DataMember]
        public int Id { get; set; }
        [DataMember]
        public int ItemId { get; set; }
        [DataMember]
        public string ItemType { get; set; }
        [DataMember]
        public string Action { get; set; }
        [DataMember]
        public string OldItem { get; set; }
        [DataMember]
        public string NewItem { get; set; }
        [DataMember]
        public DateTime Date { get; set; }
        [DataMember]
        public string Username { get; set; }
        [DataMember]
        public string CorrolationToken { get; set; }
        [DataMember]
        public int? WizardId { get; set; }
        [DataMember]
        public List<AuditLogPropertyDetail> PropertyDetails { get; private set; }
        [DataMember]
        public List<AuditLogLookupDetail> LookupDetails { get; private set; }

        private static List<string> _customRemoveColumns = new List<string>
        {
            "CreatedBy", "CreatedDate", "ModifiedBy", "ModifiedDate", "DateViewed", "Data", "LockedReason",
            "LockedToUser", "LockedToUserDisplayName", "HasApproval", "CanApprove", "CantApproveReason", "CanStart",
            "WizardConfiguration", "CorrolationToken",  "CanAdd", "CanRemove", "CanEdit", "StartType", "Id"
        };

        //list of field names that are lookups
        private static Dictionary<string, Func<List<Lookup>>> _includedLookups = new Dictionary<string, Func<List<Lookup>>>();

        static AuditResult()
        {
            _includedLookups.Add("TitleId", () =>
            {
                var result = CommonServiceLocator.ServiceLocator.Current.GetInstance<ITitleService>().GetTitles().Result;
                var list = new List<Lookup>();

                foreach (var itemTitle in result)
                {
                    list.Add(new Lookup() { Id = itemTitle.Id, Name = itemTitle.Name });
                }

                return list;
            });
        }

        public AuditResult()
        {
            PropertyDetails = new List<AuditLogPropertyDetail>();
            LookupDetails = new List<AuditLogLookupDetail>();
        }

        public AuditResult(int id, int itemId, string itemType, DateTime date, string username, string action, string correlationToken, string oldItem, string newItem, int? wizardId)
        {
            Id = id;
            ItemId = itemId;
            ItemType = itemType;
            Date = date;
            Username = username;
            Action = action;
            CorrolationToken = correlationToken;
            OldItem = oldItem;
            NewItem = newItem;
            WizardId = wizardId;
            ExtractPropertyDetails(null);
        }

        public AuditResult(int id, int itemId, string itemType, DateTime date, string username, string action, string correlationToken, string oldItem, string newItem, int? wizardId, Action<AuditResult> extractLookupDetails)
        {
            Id = id;
            ItemId = itemId;
            ItemType = itemType;
            Date = date;
            Username = username;
            Action = action;
            CorrolationToken = correlationToken;
            OldItem = oldItem;
            NewItem = newItem;
            WizardId = wizardId;

            ExtractPropertyDetails(extractLookupDetails);
        }

        public void ExtractPropertyDetails(Action<AuditResult> extractLookupDetails)
        {
            extractLookupDetails?.Invoke(this);
            PropertyDetails = new List<AuditLogPropertyDetail>();
            ExtractPropertyDetails(OldItem, NewItem);
            LookupDetails = new List<AuditLogLookupDetail>();
            ExtractLookupDetails();
        }

        private void ExtractPropertyDetails(string oldItem, string newItem)
        {
            var oldAuditItem = JsonConvert.DeserializeObject<JObject>(oldItem);
            var newAuditItem = JsonConvert.DeserializeObject<JObject>(newItem);

            foreach (var child in newAuditItem.Children().ToList())
            {
                var newValue = string.Empty;
                int itemCount = 0;
                foreach (var item in child.Values())
                {
                    itemCount++;
                    newValue += itemCount > 1 ? $", {Convert.ToString(item)}" : Convert.ToString(item);
                }

                var oldValue = Convert.ToString(oldAuditItem.GetValue(child.Path));
                PropertyDetails.Add(new AuditLogPropertyDetail(child.Path, oldValue, newValue));
            }

            FormatPropertyData();
        }

        private void FormatPropertyData()
        {
            PropertyDetails.RemoveAll(detail => _customRemoveColumns.Contains(detail.PropertyName));
            PropertyDetails.ForEach(detail => detail.PropertyName = Regex.Replace(detail.PropertyName, @"(\B[A-Z]+?(?=[A-Z][^A-Z])|\B[A-Z]+?(?=[^A-Z]))", " $1"));

            foreach (var detail in PropertyDetails)
            {
                detail.NewValue = detail.NewValue.Replace("True", "Yes");
                detail.NewValue = detail.NewValue.Replace("False", "No");

                detail.OldValue = detail.OldValue.Replace("True", "Yes");
                detail.OldValue = detail.OldValue.Replace("False", "No");

                if (string.IsNullOrWhiteSpace(detail.NewValue))
                {
                    detail.NewValue = "<no data>";
                }
                else if (detail.NewValue == "[]")
                {
                    detail.NewValue = "<no data>";
                }
                else
                {
                    if (!(detail.PropertyName.IndexOf("date", StringComparison.OrdinalIgnoreCase) >= 0)) continue;
                    if (detail.NewValue.Contains(" "))
                        detail.NewValue = detail.NewValue.Substring(0, detail.NewValue.IndexOf(" ", StringComparison.Ordinal));
                }

                if (string.IsNullOrWhiteSpace(detail.OldValue))
                {
                    detail.OldValue = "<no data>";
                }
                else if (detail.OldValue == "[]")
                {
                    detail.OldValue = "<no data>";
                }
                else
                {
                    if (!(detail.PropertyName.IndexOf("date", StringComparison.OrdinalIgnoreCase) >= 0)) continue;
                    if (detail.OldValue.Contains(" "))
                        detail.OldValue = detail.OldValue.Substring(0, detail.OldValue.IndexOf(" ", StringComparison.Ordinal));
                }
            }
        }

        private void ExtractLookupDetails()
        {
            //LOOKUPS------------------------------------------------------------------------------------------------------------
            foreach (var auditLogDetail in PropertyDetails)
            {
                if (!_includedLookups.ContainsKey(auditLogDetail.PropertyName)) continue;

                //Cater for lookups using Id and Ids
                string api = string.Empty;
                var isLookup = false;
                var isMultiLookup = false;
                if (auditLogDetail.PropertyName.EndsWith("ids", StringComparison.OrdinalIgnoreCase))
                {
                    api = auditLogDetail.PropertyName.Replace("Ids", string.Empty);
                    isLookup = true;
                    isMultiLookup = true;
                }
                if (auditLogDetail.PropertyName.EndsWith("id", StringComparison.OrdinalIgnoreCase))
                {
                    api = auditLogDetail.PropertyName.Replace("Id", string.Empty);
                    if (!string.IsNullOrEmpty(api))
                    {
                        isLookup = true;
                    }
                }

                if (isLookup)
                {
                    // TODO get lookup values
                    var lookupItems = _includedLookups[auditLogDetail.PropertyName].Invoke();
                    var oldLookupValues = new List<Lookup>();
                    var newLookupValues = new List<Lookup>();

                    if (!isMultiLookup)
                    {
                        oldLookupValues = lookupItems.Where(s => auditLogDetail.OldValue == s.Id.ToString()).ToList();
                        newLookupValues = lookupItems.Where(s => auditLogDetail.NewValue == s.Id.ToString()).ToList();
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(auditLogDetail.OldValue))
                        {
                            var oldJArray = JArray.Parse(auditLogDetail.OldValue).ToList();
                            foreach (var token in oldJArray)
                            {
                                var result = lookupItems.Where(masterlookup => masterlookup.Id == token.Value<int>());
                                oldLookupValues.AddRange(result);
                            }
                        }

                        if (!string.IsNullOrEmpty(auditLogDetail.NewValue))
                        {
                            var newJArray = JArray.Parse(auditLogDetail.NewValue).ToList();
                            foreach (var token in newJArray)
                            {
                                var result = lookupItems.Where(masterlookup => masterlookup.Id == token.Value<int>());
                                newLookupValues.AddRange(result);
                            }
                        }
                    }

                    var lookupsAuditItems = GetLookupsAudit(oldLookupValues, newLookupValues);

                    var lookupAuditDetails = new List<AuditLogLookupDetail>
                    {
                        new AuditLogLookupDetail
                        {
                            ItemType = auditLogDetail.PropertyName,
                            LookupAuditResultDetails = lookupsAuditItems
                        }
                    };

                    LookupDetails.AddRange(lookupAuditDetails);
                }
            }

            FormatLookupData();
        }

        private void FormatLookupData()
        {
            LookupDetails.ForEach(detail => detail.ItemType = Regex.Replace(detail.ItemType, @"(\B[A-Z]+?(?=[A-Z][^A-Z])|\B[A-Z]+?(?=[^A-Z]))", " $1").Replace("Id", string.Empty));
            LookupDetails.ForEach(detail => detail.ItemType = Regex.Replace(detail.ItemType, @"(\B[A-Z]+?(?=[A-Z][^A-Z])|\B[A-Z]+?(?=[^A-Z]))", " $1").Replace("Ids", string.Empty));
        }

        private static List<AuditLogLookupItem> GetLookupsAudit(List<Lookup> oldLookups, List<Lookup> newLookups)
        {
            var lookupAuditResultDetails = new List<AuditLogLookupItem>();

            if (oldLookups == null)
            {
                lookupAuditResultDetails.AddRange(newLookups.Select(i => new AuditLogLookupItem
                {
                    Status = "New",
                    Value = i.Name
                }));
            }
            else
            {
                var oldValuesToCompare = oldLookups.Select(l => l.Name).ToList();
                var newValuesToCompare = newLookups.Select(l => l.Name).ToList();

                foreach (var oldValueToCompare in oldValuesToCompare) // IF OLD VALUE IS IN NEW LIST THEN UNCHANGED
                {
                    if (newValuesToCompare.Contains(oldValueToCompare))
                    {
                        lookupAuditResultDetails.Add(new AuditLogLookupItem
                        {
                            Status = "Unchanged",
                            Value = oldValueToCompare
                        });
                    }
                    if (!newValuesToCompare.Contains(oldValueToCompare)) // IF OLD VALUE IS NOT IN NEW LIST THEN REMOVED
                    {
                        lookupAuditResultDetails.Add(new AuditLogLookupItem
                        {
                            Status = "Removed",
                            Value = oldValueToCompare
                        });
                    }
                }

                foreach (var newValueToCompare in newValuesToCompare) // IF NEW VALUE IS NOT IN OLD LIST THEN ADDED
                {
                    if (!oldValuesToCompare.Contains(newValueToCompare))
                    {
                        lookupAuditResultDetails.Add(new AuditLogLookupItem
                        {
                            Status = "Added",
                            Value = newValueToCompare
                        });
                    }
                }
            }

            return lookupAuditResultDetails;
        }
    }
}
