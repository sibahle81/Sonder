using RMA.Service.MediCare.Database.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PensionerInterviewFormDetail
    {
        public int PensionerInterviewFormDetailsId { get; set; } // PensionerInterviewFormDetailsId (Primary key)
        public int PensionerInterviewFormId { get; set; } // PensionerInterviewFormId
        public bool ExplainedCalculation { get; set; } // ExplainedCalculation
        public bool ExplainedPayDates { get; set; } // ExplainedPayDates
        public bool ExplainedProofOfLife { get; set; } // ExplainedProofOfLife
        public bool ExplainedIncreases { get; set; } // ExplainedIncreases
        public bool ExplainedMedicalTreatment { get; set; } // ExplainedMedicalTreatment
        public bool ExplainedPreAuthorisation { get; set; } // ExplainedPreAuthorisation
        public bool ExplainedMaintenance { get; set; } // ExplainedMaintenance
        public bool SuppliedBooklet { get; set; } // SuppliedBooklet
        public bool SuppliedContactDetails { get; set; } // SuppliedContactDetails
        public bool ExplainedChronicMedication { get; set; } // ExplainedChronicMedication
        public bool ExplainedTransportation { get; set; } // ExplainedTransportation
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
