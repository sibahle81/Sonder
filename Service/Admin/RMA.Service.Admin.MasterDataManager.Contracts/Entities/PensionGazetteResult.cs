using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PensionGazetteResult
    {
        public int PensionGazetteId { get; set; }
        public PensionGazetteTypeEnum PensionGazetteType { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime EffectiveTo { get; set; }
        public List<PensionGazetteIncrease> Increases { get; set; }
    }

    public class PensionGazetteIncrease
    {
        public DateTime? IncidentMinDate { get; set; }
        public DateTime? IncidentMaxDate { get; set; }
        public PensionGazetteValueTypeEnum ValueType { get; set; }
        public decimal Value { get; set; }
    }
}