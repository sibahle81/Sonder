using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Client;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class Brokerage //: Fsp
    {
        //BASE TYPE FSPE
        public string FspNumber { get; set; } // FSPNumber (length: 50)
        public string Name { get; set; } // Name (length: 255)
        public string TradeName { get; set; } // TradeName (length: 255)
        public string LegalCapacity { get; set; } // LegalCapacity (length: 255)
        public string RegNo { get; set; } // RegNo (length: 255)
        public string Status { get; set; } // Status (length: 255)
        public string CompanyType { get; set; } // CompanyType (length: 5)
        public string FaxNo { get; set; } // FaxNo (length: 20)
        public string TelNo { get; set; } // TelNo (length: 20)
        public string FspWebsite { get; set; } // FspWebsite (length: 255)
        public string FinYearEnd { get; set; } // FinYearEnd (length: 50)
        public string MedicalAccreditationNo { get; set; } // MedicalAccreditationNo (length: 255)
        public bool IsActive { get; set; }
        public bool IsAuthorised { get; set; }
        public string VatRegistrationNumber { get; set; }
        public bool FicaVerified { get; set; }
        public string FicaRiskRating { get; set; }
        public List<BrokerageContact> Contacts { get; set; }
        public List<BrokerageAddress> Addresses { get; set; }
        public List<BrokerageLicenseCategory> Categories { get; set; }
        public List<Representative> SoleProprietors { get; set; }
        public List<Representative> KeyIndividuals { get; set; }
        public List<Representative> Representatives { get; set; }

        //OTHER
        public int Id { get; set; } // Id (Primary key)
        public string Code { get; set; } // Code (length: 50)
        public System.DateTime? StartDate { get; set; } // RMA Contract StartDate
        public System.DateTime? EndDate { get; set; } // RMA Contract EndDate
        public PaymentMethodEnum PaymentMethod { get; set; } // PaymentMethodId
        public PaymentFrequencyEnum PaymentFrequency { get; set; } // PaymentFrequencyId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate   
        public BrokerageTypeEnum BrokerageType { get; set; }
        public BrokerPartnership BrokerPartnership { get; set; } // ModifiedDate   

        public List<BrokerageBankAccount> BrokerageBankAccounts { get; set; }

        public List<BrokerConsultant> BrokerageBrokerConsultants { get; set; }

        public List<int> BrokerageBrokerConsultantIds { get; set; }

        public List<Note> BrokerageNotes { get; set; }

        public List<BrokerageRepresentative> RepresentativeFscaLicenseCategories { get; set; }

        public List<BrokerageProductOption> BrokerageProductOptions { get; set; }

        public List<ValidityCheck> BrokerageChecks { get; set; }

        public List<OrganisationOptionItemValue> OrganisationOptionItemValues { get; set; }

        public string StatusText => GetBrokerageStatus(IsAuthorised, StartDate, EndDate);

        private static string GetBrokerageStatus(bool isAuthorised, DateTime? startDate, DateTime? endDate)
        {
            if (!isAuthorised) return "Unauthorised";
            if (!startDate.HasValue || startDate.Value.Date > DateTimeHelper.SaNow.Date) return "Inactive";
            return !endDate.HasValue || endDate.Value.Date >= DateTimeHelper.SaNow.Date
                ? "Active"
                : "Inactive";
        }
    }
}