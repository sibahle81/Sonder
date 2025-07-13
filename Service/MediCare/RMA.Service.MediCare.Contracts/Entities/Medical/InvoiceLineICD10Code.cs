namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceLineICD10Code
    {
        public int? Icd10CodeId { get; set; }
        public string Icd10Code { get; set; }
        public int BodySideId { get; set; }
    }
}
