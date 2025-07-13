namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class MonthlyPayment
    {
        public string EmpDescription { get; set; }
        public string AugDescription { get; set; }
        public int EmpAmount { get; set; }
        public int AugAmount { get; set; }
    }
}
