namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TreatmentBasket
    {
        public int TreatmentBasketId { get; set; }
        public int Icd10CodeId { get; set; }
        public string Icd10Code { get; set; }
        public string Description { get; set; }
    }
}
