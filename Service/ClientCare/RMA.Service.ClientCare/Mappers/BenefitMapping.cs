using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class BenefitMapping : CsvMapping<Load_Benefit>
    {
        public BenefitMapping()
        {
            this.MapProperty(0, s => s.BenefitName);
            this.MapProperty(1, s => s.BenefitType);
            this.MapProperty(2, s => s.Product);
            this.MapProperty(3, s => s.CoverMemberType);
            this.MapProperty(4, s => s.StartDate);
            this.MapProperty(5, s => s.EndDate);
            this.MapProperty(6, s => s.MinCompensation);
            this.MapProperty(7, s => s.MaxCompensation);
            this.MapProperty(8, s => s.ExcessAmount);
        }
    }
}
