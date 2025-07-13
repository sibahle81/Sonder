using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PhysicalDamage
    {
        public int PhysicalDamageId { get; set; } // PhysicalDamageId (Primary key)
        public int Icd10DiagnosticGroupId { get; set; } // ICD10DiagnosticGroupId
        public string Icd10DiagnosticGroupCode { get; set; } // Icd10DiagnosticGroupCode
        public int PersonEventId { get; set; } // PersonEventId
        public string Description { get; set; } // Description (length: 250)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public List<Injury> Injuries { get; set; }
        public int? IcdCategoryId { get; set; }
        public int? IcdSubCategoryId { get; set; }
    }
}