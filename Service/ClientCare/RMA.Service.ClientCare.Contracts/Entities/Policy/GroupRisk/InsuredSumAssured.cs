﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class InsuredSumAssured
    {
        public int InsuredSumAssuredId { get; set; } // InsuredSumAssuredId (Primary key)
        public int PersonId { get; set; } // PersonId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public decimal? AnnualSalary { get; set; } // AnnualSalary
        public decimal? Premium { get; set; } // Premium
        public decimal? ActualCoverAmount { get; set; } // ActualCoverAmount
        public decimal? PotentialCoverAmount { get; set; } // PotentialCoverAmount
        public decimal? ActualWaiverAmount { get; set; } // ActualWaiverAmount
        public decimal? PotentialWaiverAmount { get; set; } // PotentialWaiverAmount
        public decimal? MedicalPremWaiverAmount { get; set; } // MedicalPremWaiverAmount
        public decimal? ShareOfFund { get; set; } // ShareOfFund
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int BenefitDetailId { get; set; }

    }
}
