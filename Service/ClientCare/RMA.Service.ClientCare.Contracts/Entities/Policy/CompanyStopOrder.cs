using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CompanyStopOrder
    {
        public int CompanyStopOrderId { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public string Report { get; set; }
        public StopOrderExportTypeEnum StopOrderExportType { get; set; }
        public string Recipient { get; set; }
        public DateTime SalaryMonth { get; set; }
        public DateTime CutoffDate { get; set; }
    }
}
