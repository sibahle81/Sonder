using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Audit
{
    [DataContract]
    public class LastViewedResult
    {
        [DataMember]
        public int Id { get; set; }
        [DataMember]
        public int ItemId { get; set; }
        [DataMember]
        public string ItemType { get; set; }
        [DataMember]
        public DateTime Date { get; set; }
        [DataMember]
        public string Username { get; set; }

        //list of field names that are lookups
        private static readonly Dictionary<string, Func<List<Lookup>>> _includedLookups = new Dictionary<string, Func<List<Lookup>>>();

        static LastViewedResult()
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

        public LastViewedResult(int id, int itemId, string itemType, DateTime date, string username)
        {
            Id = id;
            ItemId = itemId;
            ItemType = itemType;
            Date = date;
            Username = username;
        }
    }
}
