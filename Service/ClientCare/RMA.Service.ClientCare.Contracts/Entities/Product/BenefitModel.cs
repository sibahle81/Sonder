using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitModel
    {
        public int ProductOptionId { get; set; }
        public int BenefitId { get; set; }
        public string BenefitName { get; set; }
        public string BenefitCode { get; set; }
        public CoverMemberTypeEnum CoverMemberType { get; set; }
        public BenefitTypeEnum BenefitType { get; set; }
        public int MinimumAge { get; set; }
        public int MaximumAge { get; set; }
        public decimal BaseRate { get; set; }
        public decimal BenefitAmount { get; set; }
    }
    public class StillbornBenefit
    {
        public int Id { get; set; }
        public int PolicyId { get; set; }
        public List<int> PolicyIds { get; set; }
    }
}
