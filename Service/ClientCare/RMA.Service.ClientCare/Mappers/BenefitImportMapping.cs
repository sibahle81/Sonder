using RMA.Service.ClientCare.Contracts.Entities.Product;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class BenefitImportMapping : CsvMapping<BenefitImport>
    {
        public BenefitImportMapping()
        {
            this.MapProperty(0, data => data.MemberType);
            this.MapProperty(1, data => data.BenefitName);
            this.MapProperty(2, data => data.BenefitOption);
            this.MapProperty(3, data => data.MemberOption);
            this.MapProperty(4, data => data.OptionValue);
            this.MapProperty(5, data => data.MinimumAge);
            this.MapProperty(6, data => data.MaximumAge);
            this.MapProperty(7, data => data.CoverAmount);
            this.MapProperty(8, data => data.BaseRate);
        }
    }
}
