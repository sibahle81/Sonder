using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionCover : AuditDetails
    {
        public int ProductOptionId { get; set; }
        public string Name { get; set; }
        public int? MinimumAge { get; set; }
        public int? MaximumAge { get; set; }
        public decimal? Premium { get; set; }
        public decimal? CoverAmount { get; set; }
        public CoverMemberTypeEnum CoverMemberType { get; set; }
        public ProductOption ProductOption { get; set; }

        public override string ToString()
        {
            return
                $"Min Age:{MinimumAge + Environment.NewLine} Max Age:{MaximumAge + Environment.NewLine} Premium:{Premium + Environment.NewLine} Cover Amount:{CoverAmount} ";
        }

        //Front End Compatibility
        public int CoverMemberTypeId
        {
            get => (int)CoverMemberType;
            set => CoverMemberType = (CoverMemberTypeEnum)value;
        }
    }
}