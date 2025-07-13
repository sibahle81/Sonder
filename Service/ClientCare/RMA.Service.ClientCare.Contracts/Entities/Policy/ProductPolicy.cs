using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ProductPolicy : AuditDetails
    {
        public List<int> PolicyIds { get; set; }

    }
}