using RMA.Common.Entities.DatabaseQuery;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MedicalInvoiceSearchRequest
    {
        public int? RolePlayerId { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}
