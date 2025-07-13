
using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitMedicalReportRequired
    {
        public int BenefitMedicalReportRequiredId { get; set; } // BenefitMedicalReportRequiredId (Primary key)
        public DateTime StartDate { get; set; } // StartDate
        public DateTime? EndDate { get; set; } // EndDate
        public bool IsBenefitMedicalReportRequired { get; set; } // IsBenefitMedicalReportRequired
        public int BenefitId { get; set; } // BenefitId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate      
    }
}