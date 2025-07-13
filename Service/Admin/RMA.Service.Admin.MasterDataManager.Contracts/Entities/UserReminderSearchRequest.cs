
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class UserReminderSearchRequest
    {
        public int UserId { get; set; }
        public List<UserReminderTypeEnum> UserReminderTypes { get; set; }
        public UserReminderItemTypeEnum? UserReminderItemType { get; set; }
        public int? ItemId { get; set; }
        public bool GetAlerts { get; set; }

        public PagedRequest PagedRequest { get; set; }

        public DateTime? StartDateFilter { get; set; }
        public DateTime? EndDateFilter { get; set; }
        public List<int?> UsersFilter { get; set; }
    }
}