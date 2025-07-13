using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{

    public class PostalCode
    {
        public int PostalCodeID { get; set; }
        public string Suburb { get; set; }
        public string POBoxPostalCode { get; set; }
        public string StreetPostalCode { get; set; }
        public bool IsManuallyModified { get; set; }
        public string LastChangedBy { get; set; }

        public DateTime LastChangedDate { get; set; }
        public int CityID { get; set; }



    }
}
