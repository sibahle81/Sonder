using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class EmployeeInsuredCategoryModel
    {
        public int PolicyId { get; set; } // policyId
        public int BenefitId { get; set; } // benefitId
        public string PolicyName { get; set; } // policyName
        public string BenefitName { get; set; } // benefitName

        public int PersonId { get; set; } // PersonId
        public string PersonName { get; set; } // benefitName
        public int BenefitDetailId { get; set; } // BenefitDetailId
        public int RolePlayerTypeId { get; set; } // RolePlayerTypeId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public System.DateTime SelectedDetailDate { get; set; } // Selected Effective Date


        public int PersonInsuredCategoryId { get; set; } // CategoryInsuredId (Primary key)       
        public System.DateTime PersonInsuredCategoryEffectiveDate { get; set; } // EffectiveDate
        public int BenefitCategoryId { get; set; } // BenefitCategoryId
        public string BenefitCategoryName { get; set; } // benefitCategoryName
        public int? PersonEmploymentId { get; set; } // PersonEmploymentId        
        public PersonInsuredCategoryStatusEnum? PersonInsuredCategoryStatusId { get; set; } //PersonInsuredCategoryStatusId
        public System.DateTime? DateJoinedPolicy { get; set; } // DateJoinedPolicy

        public int InsuredSumAssuredId { get; set; } // InsuredSumAssuredId (Primary key)
        public System.DateTime InsuredSumAssuredEffectiveDate { get; set; } // EffectiveDate
        public decimal? AnnualSalary { get; set; } // AnnualSalary
        public decimal? Premium { get; set; } // Premium
        public decimal? ActualCoverAmount { get; set; } // ActualCoverAmount
        public decimal? PotentialCoverAmount { get; set; } // PotentialCoverAmount
        public decimal? ActualWaiverAmount { get; set; } // ActualWaiverAmount
        public decimal? PotentialWaiverAmount { get; set; } // PotentialWaiverAmount
        public decimal? MedicalPremWaiverAmount { get; set; } // MedicalPremWaiverAmount
        public decimal? ShareOfFund { get; set; } // ShareOfFund
    }
}
