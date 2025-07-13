using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class ValidatePaymentFilesMapping : CsvMapping<Load_PremiumPaymentFileValidationContent>
    {
        public ValidatePaymentFilesMapping()
        {
            this.MapProperty(0, s => s.Company);
            this.MapProperty(1, s => s.GroupPolicyNumber);
            this.MapProperty(2, s => s.Name);
            this.MapProperty(3, s => s.MemberIdNumber);
            this.MapProperty(4, s => s.PaymentDate);
            this.MapProperty(5, s => s.PaymentAmount);

        }
    }
}
