namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Modifier : Common.Entities.AuditDetails
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsModifier { get; set; }
    }
}
