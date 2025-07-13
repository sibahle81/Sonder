using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductNotificationRequest
    {
        public List<int> RoleIds { get; set; }
        public string Name { get; set; }
        public int WizardId { get; set; }
    }
}
