using System;
using System.Linq;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TariffSearch
    {
        public int TariffId { get; set; }
        public string TariffCode { get; set; }
        public int TariffTypeId { get; set; }
        public string TariffType { get; set; }
        public string TariffDescription { get; set; }
        public int PractitionerTypeId { get; set; }
        public string PractitionerType { get; set; }
        public DateTime TariffDate { get; set; }
        public bool IncludeNappi { get; set; }
        public int MedicalItemId { get; set; }
        public decimal DefaultQuantity { get; set; }
        public decimal TariffAmount { get; set; }
        public int TariffBaseUnitCostTypeId { get; set; }
        public int TariffBaseUnitCostId { get; set; }
        public int PublicationId { get; set; }
        public bool IsModifier { get; set; }
        public decimal RecommendedUnits { get; set; }

        private TariffBaseUnitCost _tariffBaseUnitCost;
        public TariffBaseUnitCost TariffBaseUnitCost
        {
            get
            {
                return _tariffBaseUnitCost;
            }
            set
            {
                _tariffBaseUnitCost = value;
                UpdateFromBaseGazettedUnitCosts();
            }
        }

        private void UpdateFromBaseGazettedUnitCosts()
        {
            if (TariffBaseUnitCost != null && TariffBaseUnitCost.TariffBaseGazettedUnitCosts != null)
            {
                var matched = TariffBaseUnitCost.TariffBaseGazettedUnitCosts.Where(i => i.EffectiveFrom <= TariffDate && (i.EffectiveTo ?? System.DateTime.MaxValue) >= TariffDate).ToList();
                if (matched?.Count == 1) //Date range should never return more than one result, more than one result means the data is suspect.
                {
                    TariffDescription = matched[0].Description;
                    TariffAmount = RecommendedUnits * matched[0].UnitPrice;
                }
            }
        }
    }
}
