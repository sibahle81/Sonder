namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class OrganisationOptionItemValue
    {
        public int OrganisationOptionItemValueId { get; set; }
        public int? BenefitOptionItemValueId { get; set; }
        public int? ProductOptionOptionItemValueId { get; set; }
        public int? BrokerageId { get; set; }
        public int? RolePlayerId { get; set; }
        public System.DateTime EffectiveDate { get; set; }
        public decimal? Value { get; set; }
        public bool IsExtended { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
    }
}
