using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalPreAuthExistCheckParams
    {
        public DateTime? DateAdmitted { get; set; }//treatmentFromDate
        public DateTime? DateDischarged { get; set; }//treatmentTDate
        public int? PersonEventId { get; set; }
        public int? HealthCareProviderId { get; set; }
    }
}
