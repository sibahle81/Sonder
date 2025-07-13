using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class Scheme : AuditDetails
    {
        public string Name { get; set; }
        public string CoverOption { get; set; }
        public string Code { get; set; }
    }
}