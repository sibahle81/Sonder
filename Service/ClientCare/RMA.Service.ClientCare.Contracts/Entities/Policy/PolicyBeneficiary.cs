using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyBeneficiary : AuditDetails
    {
        public BeneficiaryTypeEnum BeneficiaryType { get; set; }
        public int InsuredLifeId { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Email { get; set; }
        public string TelephoneNumber { get; set; }
        public string MobileNumber { get; set; }
        public decimal AllocationPercentage { get; set; }
        public bool? IsChildDisabled { get; set; }
        public bool? IsInsuredLife { get; set; }
        public bool? IsBeneficiary { get; set; }
        public int? InsuredLifeProductOptionCover { get; set; }
        public decimal TotalCoverAmount { get; set; }
    }
}