using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PayeeType : AuditDetails
    {
        public int PayeeTypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsSundry { get; set; }
        public bool IsMedical { get; set; }
        public bool IsPd { get; set; }
        public bool IsFatal { get; set; }
        public bool IsDaysOff { get; set; }
        public bool IsFuneralBenefit { get; set; }
        public bool IsPension { get; set; }
    }
}
