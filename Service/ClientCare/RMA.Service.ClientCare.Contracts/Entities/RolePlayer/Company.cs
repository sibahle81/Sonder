using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Company
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string Name { get; set; } // Name (length: 255)
        public string Description { get; set; } // Description (length: 255)
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 50)
        public string CompensationFundReferenceNumber { get; set; } // CompensationFundReferenceNumber (length: 50)
        public CompanyIdTypeEnum? CompanyIdType { get; set; } // CompanyIdTypeId
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public string VatRegistrationNo { get; set; } // VatRegistrationNo (length: 50)
        public int? IndustryId { get; set; } // IndustryId
        public IndustryClassEnum? IndustryClass { get; set; } // IndustryClassId
        public CompanyLevelEnum? CompanyLevel { get; set; } // CompanyLevelId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public int? LinkedCompanyId { get; set; } // LinkedCompanyId
        public bool IsTopEmployer { get; set; } // IsTopEmployer
        public string NatureOfBusiness { get; set; } // NatureOfBusiness (length: 255)
        public CompensationFundStatusEnum? CompensationFundStatus { get; set; } // CompensationFundStatusId
        public string CompanyName { get; set; }
        public string CompanyRegNo { get; set; }
        public string Code { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public string ContactPersonName { get; set; }
        public string ContactDesignation { get; set; }
        public string ContactTelephone { get; set; }
        public string ContactMobile { get; set; }
        public string ContactEmail { get; set; }
        public string FinPayeNumber { get; set; }
        public List<RolePlayerPolicy> RolePlayerPolicies { get; set; }
        public SchemeClassification SchemeClassification { get; set; }
    }
}
