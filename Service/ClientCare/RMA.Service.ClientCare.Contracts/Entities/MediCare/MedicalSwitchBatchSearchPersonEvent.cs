using System;

namespace RMA.Service.ClientCare.Contracts.Entities.MediCare
{
    public class MedicalSwitchBatchSearchPersonEvent
    {
        public string IndustryNumber { get; set; }
        public string CoemployeeNo { get; set; }
        public string Surname { get; set; }
        public string PensionNumber { get; set; }
        public string FullFirstname { get; set; }
        public string PassportNumber { get; set; }
        public string Initials { get; set; }
        public int PassportNationality { get; set; }
        public string IdNumber { get; set; }
        public int EventId { get; set; }
        public int PersonEventId { get; set; }
        public int ClaimId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string OtherIdentification { get; set; }
        public string MainClaimRefNo { get; set; }
        public Nullable<DateTime> DateOfBirth { get; set; }
        public Nullable<DateTime> DateOfEvent { get; set; }
        public string EventDescription { get; set; }
        public int AccidentDetailPersonEventId { get; set; }
        public bool IsFatal { get; set; }
    }
}

