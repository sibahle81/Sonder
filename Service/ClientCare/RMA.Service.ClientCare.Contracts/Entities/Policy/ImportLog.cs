using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ImportLog : AuditDetails
    {
        public int ImportId { get; set; }
        public string Message { get; set; }
        public int RowNumber { get; set; }
    }
}
