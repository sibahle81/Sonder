using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class MedicalReportForm : Integration
    {
        public int MedicalReportFormId { get; set; }
        public SourceSystemEnum MedicalReportSystemSource { get; set; }

        #region ClaimDetails
        public string ClaimReferenceNumber { get; set; }
        public int? ClaimId { get; set; }
        public int PersonEventId { get; set; }
        public int EventCategoryId { get; set; }
        public System.DateTime EventDate { get; set; }
        public System.DateTime DateOfBirth { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Gender { get; set; }
        public string ContactNumber { get; set; }
        public string IndustryNumber { get; set; }
        public string ClaimantOccupation { get; set; }
        public string EmployerName { get; set; }
        #endregion

        public DateTime ConsultationDate { get; set; }
        public DateTime ReportDate { get; set; }
        public string Icd10Codes { get; set; }
        public string Icd10CodesJson { get; set; }
        public string HealthcareProviderName { get; set; }
        public string HealthcareProviderPracticeNumber { get; set; }
        public int HealthcareProviderId { get; set; }
        public int WorkItemId { get; set; }
        public int CompcareMedicalReportId { get; set; }
        public int ReportCategoryId { get; set; }
        public int ReportTypeId { get; set; }
        public string ReportStatus { get; set; }
        public string ReportStatusDetail { get; set; }
        public int ReportStatusId { get; set; }
        public int? MedicalReportRejectionReasonId { get; set; }
        public string MedicalReportRejectionReasonDescription { get; set; }
        public int TenantId { get; set; }
        public bool IsDeclarationAccepted { get; set; }

        public DateTime? UnfitStartDate { get; set; }
        public DateTime? UnfitEndDate { get; set; }
        public string BodySideDetails { get; set; }
        public System.DateTime? NextReviewDate { get; set; }
        public int? DocumentId { get; set; }
        public string ReportCategoryData { get; set; }

        public DocumentStatusEnum? DocumentStatusId { get; set; }


        public bool IsUnfitForWork() { return UnfitStartDate.HasValue && UnfitStartDate.Value > DateTime.MinValue; }

        public int EstimatedDaysOff
        {
            get
            {
                if (UnfitStartDate.HasValue && UnfitEndDate.HasValue)
                    return (UnfitEndDate.Value - UnfitStartDate.Value).Days + 1;
                return 0;
            }
        }
    }
}
