using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TebaTariff : Common.Entities.AuditDetails
    {
        public int TariffId { get; set; } // TariffId (Primary key)
        public string TariffCode { get; set; } // TariffCode (length: 50)
        public string Description { get; set; } // Description (length: 200)
        public string InvoicingDescription { get; set; } // InvoicingDescription (length: 150)
        public System.DateTime ValidFrom { get; set; } // ValidFrom
        public System.DateTime ValidTo { get; set; } // ValidTo
        public decimal CostValue { get; set; } // CostValue
        public decimal MinimumValue { get; set; } // MinimumValue
        public decimal AdminFeePercentage { get; set; } // AdminFeePercentage
        public TebaTariffCategoryEnum? TebaTariffCategory { get; set; } // TariffCategoryId
        public string RuleDescription { get; set; } // RuleDescription (length: 150)
    }
}
