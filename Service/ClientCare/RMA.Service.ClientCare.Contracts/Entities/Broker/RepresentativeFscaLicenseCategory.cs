using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class RepresentativeFscaLicenseCategory
    {
        public int Id { get; set; } // Id (Primary key)
        public int RepresentativeId { get; set; } // RepresentativeId
        public int FscaLicenseCategoryId { get; set; } // FscaLicenseCategoryId
        public int BrokerageId { get; set; } // BrokerageId
        public DateTime? AdviceDateActive { get; set; } // AdviceDateActive
        public DateTime? IntermediaryDateActive { get; set; } // IntermediaryDateActive
        public DateTime? SusDateActive { get; set; } // SusDateActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate

        public Brokerage Brokerage { get; set; }
        public Representative Representative { get; set; }
        public FscaLicenseCategory FscaLicenseCategory { get; set; }
    }
}
