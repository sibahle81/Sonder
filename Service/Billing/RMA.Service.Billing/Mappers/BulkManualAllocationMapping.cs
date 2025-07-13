using RMA.Service.Billing.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.Billing.Mappers
{

    public class BulkManualAllocationMapping : CsvMapping<Load_BulkManualAllocation>
    {
        public BulkManualAllocationMapping()
        {
            this.MapProperty(0, s => s.BankAccountNumber);
            this.MapProperty(1, s => s.Amount);
            this.MapProperty(2, s => s.StatementReference);
            this.MapProperty(3, s => s.TransactionDate);
            this.MapProperty(4, s => s.UserReference);
            this.MapProperty(5, s => s.UserReference2);
            this.MapProperty(6, s => s.AllocateTo);
        }
    }
}
