namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class LevelOfCare : Common.Entities.AuditDetails
    {
        public int LevelOfCareId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
