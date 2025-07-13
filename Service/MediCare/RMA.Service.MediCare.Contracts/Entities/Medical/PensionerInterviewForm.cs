using RMA.Service.MediCare.Database.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PensionerInterviewForm
    {
        public int PensionerInterviewFormId { get; set; } // PensionerInterviewFormId (Primary key)
        public int PensionerId { get; set; } // PensionerId
        public System.DateTime InterviewDate { get; set; } // InterviewDate
        public byte? Relocation { get; set; } // Relocation
        public string ChronicMedicine { get; set; } // ChronicMedicine (length: 2048)
        public string FurtherTreatment { get; set; } // FurtherTreatment (length: 2048)
        public string Transporting { get; set; } // Transporting (length: 2048)
        public int? BranchId { get; set; } // BranchId
        public int TebaLocationId { get; set; } // TebaLocationId
        public string InfoBrochure { get; set; } // InfoBrochure (length: 2048)
        public string Col { get; set; } // COL (length: 2048)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public bool? IsInjury { get; set; } // IsInjury
        public string OccupationaInjuryName { get; set; } // OccupationaInjuryName (length: 150)
        public bool? IsDisease { get; set; } // IsDisease
        public string OccupationalDiseaseName { get; set; } // OccupationalDiseaseName (length: 150)
        public bool? IsAmputee { get; set; } // IsAmputee
        public bool? IsWheelchairIssued { get; set; } // IsWheelchairIssued
        public System.DateTime? WheelchairIssued { get; set; } // WheelchairIssued
        public string MakeModel { get; set; } // MakeModel (length: 150)
        public System.DateTime? ApplianceReviewDate { get; set; } // ApplianceReviewDate
        public string LimbAmputated { get; set; } // LimbAmputated (length: 50)
        public string LevelOfAmputation { get; set; } // LevelOfAmputation (length: 50)
        public bool? IsCaa { get; set; } // IsCAA
        public bool? IsInstitutionalised { get; set; } // IsInstitutionalised
        public string NameOfInstitution { get; set; } // NameOfInstitution (length: 50)
        public string ContactNoOfInstitution { get; set; } // ContactNoOfInstitution (length: 10)
        public List<PensionerInterviewFormDetail> PensionerInterviewFormDetails { get; set; }
    }
}
