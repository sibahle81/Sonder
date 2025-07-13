using RMA.Service.ClaimCare.Contracts.Entities;

using TinyCsvParser.Mapping;
using TinyCsvParser.TypeConverter;

namespace RMA.Service.ClaimCare.Mappers
{
    public class CsvUnclaimedBenefitMapping : CsvMapping<UnclaimedBenefitInterest>
    {
        private const string DateFormat = "dd/MM/yyyy";

        public CsvUnclaimedBenefitMapping()
        : base()
        {
            MapProperty(0, x => x.StartDate, new DateTimeConverter(DateFormat));
            MapProperty(1, x => x.EndDate, new DateTimeConverter(DateFormat));
            MapProperty(2, x => x.Naca);
            MapProperty(3, x => x.InvestmentPeriod);
            MapProperty(4, x => x.CumulativeRate);
            MapProperty(5, x => x.IncrementalRate);
        }
    }
}
