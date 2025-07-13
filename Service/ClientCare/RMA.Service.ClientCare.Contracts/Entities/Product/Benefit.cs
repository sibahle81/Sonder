using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class Benefit
    {
        public int Id { get; set; } // Id (Primary key)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate        
        public string Name { get; set; } // Name (length: 50)
        public string Code { get; set; } // Code (length: 50)
        public int ProductId { get; set; } // Code (length: 50)
        public bool IsMedicalReportRequired { get; set; } // Code (length: 50)
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public BenefitTypeEnum BenefitType { get; set; } // BenefitTypeId
        public CoverMemberTypeEnum CoverMemberType { get; set; } // CoverMemberTypeId
        public List<Note> BenefitNotes { get; set; } // Benefit Notes List
        public List<BenefitRate> BenefitRates { get; set; }
        public List<RuleItem> RuleItems { get; set; }
        public int? EstimateTypeId { get; set; }
        public DisabilityBenefitTermEnum? DisabilityBenefitTerm { get; set; }
        public BenefitGroupEnum? BenefitGroup { get; set; }
        public string BillingLevel { get; set; }

        public List<BenefitAddBeneficiary> BenefitAddBeneficiaries { get; set; }
        public List<BenefitCaptureEarning> BenefitCaptureEarnings { get; set; }
        public List<BenefitCompensationAmount> BenefitCompensationAmounts { get; set; }
        public List<BenefitCoverMemberType> BenefitCoverMemberTypes { get; set; }
        public List<BenefitMedicalReportRequired> BenefitMedicalReportRequireds { get; set; }
        public List<BenefitEarningsRangeCalcs> BenefitEarningsRangeCalcs { get; set; }

        //Other
        public List<int> EarningTypeIds { get; set; }
        public List<int> MedicalReportTypeIds { get; set; }
        public List<int> productOptionIds { get; set; }

        public decimal BenefitRateLatest { get; set; }
        public decimal BenefitBaseRateLatest { get; set; }
        public decimal? ExcessAmount { get; set; }

        public ProductStatusEnum BenefitStatus => GetBenefitStatus(EndDate);

        public decimal? MinCompensationAmount { get; set; } // MinCompensationAmount
        public decimal? MaxCompensationAmount { get; set; } // MaxCompensationAmount

        public string StatusText => GetBenefitStatus(EndDate).DisplayAttributeValue();

        private static ProductStatusEnum GetBenefitStatus(DateTime? endDate)
        {
            return !endDate.HasValue || endDate.Value.Date >= DateTimeHelper.SaNow
                ? ProductStatusEnum.OpenForBusiness
                : ProductStatusEnum.ClosedForBusiness;
        }
    }
}