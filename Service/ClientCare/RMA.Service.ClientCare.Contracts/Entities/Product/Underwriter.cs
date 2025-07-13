using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class Underwriter
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int TenantId { get; set; }

        public List<Product> Products { get; set; }
    }
}
