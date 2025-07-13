namespace RMA.Service.MediCare.Contracts.Entities.Medical
{

    public class ChronicMedicationList : Common.Entities.AuditDetails
    {
        public int CmlId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
