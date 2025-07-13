namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class RejectedCommissionPaymentModel
    {
        public int PaymentId { get; set; }
        public int PaymentInstructionId { get; set; }
        public int HeaderId { get; set; }
    }
}
