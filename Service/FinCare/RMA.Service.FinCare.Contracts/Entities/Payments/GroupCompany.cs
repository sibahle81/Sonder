﻿using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class GroupCompany
    {
        public int GroupCompanyId { get; set; } // GroupCompanyID (Primary key)
        public string GroupCompanyName { get; set; } // GroupCompanyName (length: 50)
        public string GroupCompanyDescription { get; set; } // GroupCompanyDescription (length: 100)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 20)
        public int? CompanyNo { get; set; } // CompanyNo
        public int? BranchNo { get; set; } // BranchNo
        public bool IsCoid { get; set; } // IsCoid
        public bool? IsCompensation { get; set; } // IsCompensation
        public bool? IsPensions { get; set; } // IsPensions
        public IndustryClassEnum? IndustryClass { get; set; } // IndustryClassId
        public string TransactionType { get; set; } // TransactionType (length: 50)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
