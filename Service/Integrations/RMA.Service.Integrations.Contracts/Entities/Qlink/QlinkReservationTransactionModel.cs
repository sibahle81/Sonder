namespace RMA.Service.Integrations.Contracts.Entities.Qlink
{
    public class QlinkReservationTransactionModel
    {
        public int QlinkReservationTransactionId { get; set; }
        public int QlinkParentTransactionId { get; set; }
        public int? QlinkChildTransactionId { get; set; }
        public bool ReservationActivated { get; set; }
        public bool IsDeleted { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public string Comment { get; set; }
    }
}
