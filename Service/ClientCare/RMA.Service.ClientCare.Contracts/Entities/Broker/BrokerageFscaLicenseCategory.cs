using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageFscaLicenseCategory
    {
        public int Id { get; set; } // Id (Primary key)
        public int BrokerageId { get; set; } // BrokerageId
        public int FscaLicenseCategoryId { get; set; } // FscaLicenseCategoryId
        public DateTime? AdviceDateActive { get; set; } // AdviceDateActive
        public DateTime? IntermediaryDateActive { get; set; } // IntermediaryDateActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate

        public Brokerage Brokerage { get; set; }
        public FscaLicenseCategory FscaLicenseCategory { get; set; }
    }
}
