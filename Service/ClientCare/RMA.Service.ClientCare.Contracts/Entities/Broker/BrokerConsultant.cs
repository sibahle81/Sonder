namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerConsultant
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public string TelNo { get; set; }
        public bool IsActive { get; set; }
        public int BrokerageId { get; set; }
    }
}
