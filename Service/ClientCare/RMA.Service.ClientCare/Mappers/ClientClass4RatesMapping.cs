using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class ClientClass4RatesMapping : CsvMapping<Load_ClientClass4Rates>
    {
        public ClientClass4RatesMapping()
        {
            this.MapProperty(0, s => s.Product);
            this.MapProperty(1, s => s.MemberNo);
            this.MapProperty(2, s => s.Category);
            this.MapProperty(3, s => s.BenefitSet);
            this.MapProperty(4, s => s.RateType);
            this.MapProperty(5, s => s.Rate);
            this.MapProperty(6, s => s.StartDate);
            this.MapProperty(7, s => s.EndDate);

        }
    }
}
