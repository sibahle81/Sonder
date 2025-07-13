namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthTreatmentBasket : Common.Entities.AuditDetails
    {
        public int PreAuthTreatmentBasketId { get; set; }
        public int PreAuthId { get; set; }
        public int TreatmentBasketId { get; set; }
        public bool? IsAuthorised { get; set; }
        public bool IsClinicalUpdate { get; set; }
        public short? UpdateSequenceNo { get; set; }
        public int? ClinicalUpdateId { get; set; }
    }
}
