using RMA.Common.Entities;

using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PublicHoliday : AuditDetails
    {
        public string Name { get; set; }
        public DateTime HolidayDate { get; set; }
    }
}