namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ProstheticItem : Common.Entities.AuditDetails
    {
        public int ProstheticItemId { get; set; } // ProstheticItemId (Primary key)
        public int? RegionGroupId { get; set; } // RegionGroupId
        public int? ProstheticItemCategoryId { get; set; } // ProstheticItemCategoryId
        public string ItemCode { get; set; } // ItemCode (length: 50)
        public short? NoOfUnits { get; set; } // NoOfUnits
        public short? ReplacementPeriodFromMnths { get; set; } // ReplacementPeriodFromMnths
        public short? ReplacementPeriodToMnths { get; set; } // ReplacementPeriodToMnths
        public string Notes { get; set; } // Notes (length: 2048)
        public byte? IsSupplierGurantee { get; set; } // IsSupplierGurantee
        public short? SupGuranteePeriodMnths { get; set; } // SupGuranteePeriodMnths
        public string Narration { get; set; } // Narration (length: 1024)
    }
}
