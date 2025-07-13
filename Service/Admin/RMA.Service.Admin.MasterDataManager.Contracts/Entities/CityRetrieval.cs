namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class CityRetrieval
    {
        public int CityId { get; set; } // CityID (Primary key)
        public string Code { get; set; } // Code (length: 12)
        public string Suburb { get; set; } // Name (length: 255)
        public string City { get; set; } // Description (length: 2048)
        public int? ForeignRegionCodeId { get; set; } // ForeignRegionCodeID
        public int? IsActive { get; set; } // IsActive
        public string LastChangedBy { get; set; } // LastChangedBy (length: 30)
        public System.DateTime? LastChangedDate { get; set; } // LastChangedDate
        public int? CountryId { get; set; } // CountryID
        public bool? IsManuallyEdited { get; set; } // IsManuallyEdited
        public int? ForeignPmpRegionId { get; set; } // ForeignPMPRegionId
        public int? ForeignRmaBranchId { get; set; } // ForeignRMABranchId
        public string Province { get; set; } // Name (length: 255)

        public override string ToString()
        {
            return Suburb;
        }
    }
}
