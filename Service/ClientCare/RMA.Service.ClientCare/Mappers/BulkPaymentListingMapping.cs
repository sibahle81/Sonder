using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class BulkPaymentListingMapping : CsvMapping<Load_BulkPaymentListing>
    {
        public BulkPaymentListingMapping()
        {
            this.MapProperty(0, s => s.PolicyNumber);
            this.MapProperty(1, s => s.PaymentAmount);
        }
    }
}
