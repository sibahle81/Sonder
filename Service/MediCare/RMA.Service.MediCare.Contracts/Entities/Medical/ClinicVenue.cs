using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ClinicVenue : AuditDetails
    {
        public int ClinicVenueId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string LastChangedBy { get; set; }
        public System.DateTime? LastChangedDate { get; set; }
        public int? PmpRegionId { get; set; }
        public int ClinicBookingTypeId { get; set; }
        public int? TebaLocationId { get; set; }
        public int? MobileClinicBookingTypeId { get; set; }
    }
}
