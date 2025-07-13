namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ModifierTariff : Common.Entities.AuditDetails
    {
        public string ModifierCode { get; set; }
        public string TariffCode { get; set; }
        public int? PublicationId { get; set; }
        public int? SectionId { get; set; }
        public decimal? Price { get; set; }
        public byte? IsIncludeTariff { get; set; }
        public byte? IsExcludeTariff { get; set; }
    }
}
