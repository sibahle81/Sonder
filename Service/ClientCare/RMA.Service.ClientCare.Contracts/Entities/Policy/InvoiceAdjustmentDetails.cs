using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class InvoiceAdjustmentDetails
    {
        public int PolicyId { set; get; }
        public bool IsGroupPolicy { set; get; } = false;
        public DateTime TransactionDate { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; }
        public int? LinkedInvoiceId { get; set; }
        public SourceModuleEnum SourceModule { set; get; }
        public SourceProcessEnum sourceProcess { set; get; }

    }
}
