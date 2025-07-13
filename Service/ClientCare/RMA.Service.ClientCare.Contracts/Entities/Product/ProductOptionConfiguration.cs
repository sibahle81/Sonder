using RMA.Service.ClientCare.Contracts.Entities.Client;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionConfiguration
    {
        public int Id { get; set; } // Id (Primary key)
        public int? ProductOptionId { get; set; }
        public string ProductOptionCode { get; set; }
        public string ProductOptionName { get; set; }
        public int? BenefitId { get; set; }
        public string BenefitCode { get; set; }
        public string BenefitName { get; set; }
        public int OptionTypeId { get; set; }
        public string OptionTypeCode { get; set; }
        public string OptionTypeName { get; set; }
        public int OptionItemId { get; set; }
        public string OptionItemCode { get; set; }
        public string OptionItemName { get; set; }
        public DateTime EffectiveDate { get; set; }
        public decimal? ProductOptionOptionValue { get; set; }
        public string OptionLevel { get; set; }
        public string ProductCode { get; set; }
        public bool AllowPolicyOverride { get; set; }
        public bool AllowRolePlayerOverride { get; set; }
        public int? BenefitOptionItemValueId { get; set; }
        public int? ProductOptionOptionItemValueId { get; set; }

        public OrganisationOptionItemValue OrganisationOptionItemValue { get; set; }
    }
}
