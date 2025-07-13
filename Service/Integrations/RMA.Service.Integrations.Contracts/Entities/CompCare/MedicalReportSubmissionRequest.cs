using System;
using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{
    public class MedicalReportSubmissionRequest
    {
        public int medicalReportCategoryId { get; set; }
        public int medicalReportTypeId { get; set; }
        public DateTime reportDate { get; set; }
        public List<Icd10Code> icd10Codes { get; set; }
        public int personEventID { get; set; }
        public string lastChangedBy { get; set; }
        public string sourceSystemReference { get; set; }
        public string sourceSystemRoutingID { get; set; }
        public string healthCareProviderPracticeNumber { get; set; }
        public DateTime consultationDate { get; set; }


        public bool isUnfitForwork { get; set; }
        public DateTime firstDayOff { get; set; }
        public int estimatedDaysOff { get; set; }
        public DateTime lastDayOff { get; set; }
        public DateTime firstConsultationDate { get; set; }
        public string clinicalDescription { get; set; }
        public string notStabilisedReason { get; set; }
        public string contributingDescription { get; set; }
        public string preExistingConditionDescription { get; set; }
        public string referralHistory { get; set; }
        public string radiologicalExaminations { get; set; }
        public string physiotherapyDetails { get; set; }
        public string operationProcedureDescription { get; set; }
        public string detailedImpairmentEvaluation { get; set; }

        public bool isInjuryConsistentWithMechanismOfInjury { get; set; }
        public bool isContributingCause { get; set; }
        public bool isPreExistingCondition { get; set; }
        public bool isStabilised { get; set; }
        public DateTime? dateStabilised { get; set; }
        public DateTime? pevStabilisedDate { get; set; }
    }

    public class RootMedicalReportSubmissionRequest
    {
        public MedicalReportSubmissionRequest request { get; set; }
    }
}
