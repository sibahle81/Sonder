namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitImport
    {
        public string MemberType { get; set; }
        public string BenefitName { get; set; }
        public string BenefitOption { get; set; }
        public string MemberOption { get; set; }
        public string OptionValue { get; set; }
        public int MinimumAge { get; set; }
        public int MaximumAge { get; set; }
        public decimal CoverAmount { get; set; }
        public decimal BaseRate { get; set; }
        public string BenefitCode { get; set; }
    }
}
