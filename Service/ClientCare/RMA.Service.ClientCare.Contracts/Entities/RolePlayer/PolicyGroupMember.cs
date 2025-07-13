using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class PolicyGroupMember
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public PolicyStatusEnum PolicyStatus { get; set; }
        public string ClientReference { get; set; }
        public int RolePlayerId { get; set; }
        public RolePlayerTypeEnum RolePlayerType { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public DateTime? PolicyJoinDate { get; set; }
        public InsuredLifeStatusEnum? InsuredLifeStatus { get; set; }
        public decimal? Premium { get; set; }
        public decimal? CoverAmount { get; set; }
        public int? StatedBenefitId { get; set; }
        public BenefitRate BenefitRate { get; set; }
    }
}
