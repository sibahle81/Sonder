namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class NatureOfBusiness
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SicCode { get; set; } // SICCode (length: 10)
        public string Category { get; set; } // Category (length: 50)
        public string Description { get; set; } // Description (length: 300)

        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public System.DateTime? ExpireDate { get; set; } // ExpireDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
    }
}