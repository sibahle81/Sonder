using RMA.Common.Entities;

using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthLevelOfCare : AuditDetails
    {
        public int PreAuthLevelOfCareId { get; set; }
        public int PreAuthBreakdownId { get; set; }
        public int LevelOfCareId { get; set; }
        public DateTime DateTimeAdmitted { get; set; }
        public DateTime DateTimeDischarged { get; set; }
        public decimal LengthOfStay { get; set; }
        public string TariffCode { get; set; }
        public string LevelOfCare { get; set; }
    }
}
