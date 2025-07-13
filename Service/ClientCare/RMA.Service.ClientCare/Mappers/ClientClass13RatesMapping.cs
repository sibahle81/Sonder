using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class ClientClass13RatesMapping : CsvMapping<Load_ClientClass13Rates>
    {
        public ClientClass13RatesMapping()
        {
            this.MapProperty(0, s => s.RefNo);
            this.MapProperty(1, s => s.CompanyName);
            this.MapProperty(2, s => s.Industry);
            this.MapProperty(3, s => s.IndustryGroup);
            this.MapProperty(4, s => s.EmpCategory);
            this.MapProperty(5, s => s.IndRate);
            this.MapProperty(6, s => s.PremRate);
            this.MapProperty(7, s => s.GpLimited);
            this.MapProperty(8, s => s.FinalRate);
            this.MapProperty(9, s => s.DiscountOrLoading);
            this.MapProperty(10, s => s.DiscountOrLoadingStatus);
            this.MapProperty(11, s => s.RatingYear);
            this.MapProperty(12, s => s.LoadDate);
            this.MapProperty(13, s => s.Product);
        }
    }
}
