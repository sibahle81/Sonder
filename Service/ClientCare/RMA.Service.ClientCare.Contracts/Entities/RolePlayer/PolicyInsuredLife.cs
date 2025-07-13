using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class PolicyInsuredLife
    {
        public int PolicyId { get; set; }
        public int RolePlayerId { get; set; }
        public int StatedBenefitId { get; set; }
        public int RolePlayerTypeId { get; set; }
        public InsuredLifeStatusEnum? InsuredLifeStatus { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public InsuredLifeRemovalReasonEnum? InsuredLifeRemovalReason { get; set; }
        public int? Skilltype { get; set; }
        public decimal? Earnings { get; set; }
        public decimal? Allowance { get; set; }
        public decimal? Premium { get; set; } // Premium
        public decimal? CoverAmount { get; set; } // CoverAmount
        public bool? IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        public RolePlayer RolePlayer { get; set; }
        public string PolicyNumber { get; set; }
        public int PolicyStatusId { get; set; }
    }
}