namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PreAuthCodeLimit : Common.Entities.AuditDetails
    {
        public int PreAuthCodeLimitId { get; set; }
        public string MedicalItemCode { get; set; }
        public int PractitionerTypeId { get; set; }
        public bool IsValidatePractitioner { get; set; }
        public decimal? AuthorisationQuantityLimit { get; set; }
        public int? AuthorisationDaysLimit { get; set; }
    }
}
