using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BenefitPayrollInvoice
    {
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal TotalInvoiceAmount { get; set; }
        public int BenefitPayrollId { get; set; }
        public int BenefitRateId { get; set; }
    }
}
