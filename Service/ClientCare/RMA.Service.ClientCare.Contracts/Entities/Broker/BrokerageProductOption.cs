using RMA.Service.ClientCare.Contracts.Entities.Product;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageProductOption
    {
        public int Id { get; set; }
        public int BrokerageId { get; set; }
        public int ProductOptionId { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime? EndDate { get; set; }

        public ProductOption ProductOption { get; set; }
    }
}
