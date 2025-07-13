using RMA.Service.Integrations.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.MediCare
{
    public class MedicalInvoiceUpdateMessage
    {
        public int MedicalInvoiceId { get; set; }
        public int CompCareMedicalInvoiceId { get; set; }
        public int CompCareClaimId { get; set; }
        public ActionEnum Action { get; set; }
    }
}
