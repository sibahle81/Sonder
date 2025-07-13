namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalItemType : Common.Entities.AuditDetails
    {
        public int MedicalItemTypeId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }
}
