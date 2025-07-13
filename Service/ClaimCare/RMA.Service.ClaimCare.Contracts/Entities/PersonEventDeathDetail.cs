using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventDeathDetail
    {
        public int PersonEventId { get; set; }
        public DeathTypeEnum DeathType { get; set; }
        public int? CauseOfDeath { get; set; }
        public string DhaReferenceNo { get; set; }
        public string DeathCertificateNo { get; set; }
        public bool InterviewWithFamilyMember { get; set; }
        public bool OpinionOfMedicalPractitioner { get; set; }
        public DateTime DeathDate { get; set; }
        public string HomeAffairsRegion { get; set; }
        public string PlaceOfDeath { get; set; }
        public string DateOfPostmortem { get; set; }
        public string PostMortemNumber { get; set; }
        public string BodyNumber { get; set; }
        public string SapCaseNumber { get; set; }
        public int BodyCollectorId { get; set; }
        public int UnderTakerId { get; set; }
        public int FuneralParlorId { get; set; }
        public int DoctorId { get; set; }
        public int ForensicPathologistId { get; set; }
        public DateTime? BodyCollectionDate { get; set; }
        public string CauseOfDeathDescription { get; set; }
        public int DeathTypeId
        {
            get => (int)DeathType;
            set => DeathType = (DeathTypeEnum)value;
        }
    }
}