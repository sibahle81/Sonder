using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class MemberCancelMapping : CsvMapping<Load_MemberCancel>
    {
        public MemberCancelMapping()
        {
            this.MapProperty(0, s => s.UnderWritingYear);
            this.MapProperty(1, s => s.Product);
            this.MapProperty(2, s => s.MemberNo);
            this.MapProperty(3, s => s.MemberName);
            this.MapProperty(4, s => s.CancellationDate);
            this.MapProperty(5, s => s.CancellationReason);
            this.MapProperty(6, s => s.IndustryClass);
        }
    }
}
