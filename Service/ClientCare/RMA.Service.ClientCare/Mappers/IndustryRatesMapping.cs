using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class IndustryRatesMapping : CsvMapping<Load_IndustryRate>
    {
        public IndustryRatesMapping()
        {
            MapProperty(0, s => s.Industry);
            MapProperty(1, s => s.IndustryGroup);
            MapProperty(2, s => s.EmployeeCategory);
            MapProperty(3, s => s.IndustryRate);
            MapProperty(4, s => s.RatingYear);
        }
    }
}
